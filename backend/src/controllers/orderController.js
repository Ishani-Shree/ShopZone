const pool = require("../config/db");

// CHECKOUT — creates order as pending_payment, deducts stock
const checkout = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    await client.query("BEGIN");

    const cart = await client.query(
      `SELECT cart_items.*, products.price, products.stock
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.user_id = $1`,
      [userId]
    );

    if (cart.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock
    for (const item of cart.rows) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Insufficient stock for one or more items` });
      }
    }

    let total = 0;
    cart.rows.forEach((item) => { total += item.price * item.quantity; });

    const order = await client.query(
      `INSERT INTO orders (user_id, total_price, status)
       VALUES ($1, $2, 'pending_payment') RETURNING *`,
      [userId, total]
    );

    const orderId = order.rows[0].id;

    for (const item of cart.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    await client.query("COMMIT");

    res.json({ message: "Order created", order: order.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// PAY ORDER — marks order as confirmed (simulated payment or COD)
const payOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, method = "card" } = req.body;

    const result = await pool.query(
      `UPDATE orders SET status = 'confirmed'
       WHERE id = $1 AND user_id = $2 AND status = 'pending_payment'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found or already processed" });
    }

    res.json({
      message: method === "cod" ? "Order confirmed with Cash on Delivery" : "Payment successful",
      order: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CANCEL ORDER — cancels order and restores stock
const cancelOrder = async (req, res) => {
  const client = await pool.connect();
  let began = false;
  try {
    const userId = req.user.id;
    const { id } = req.body;

    console.log(`[cancelOrder] user=${userId} order=${id}`);

    await client.query("BEGIN");
    began = true;

    const order = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status != 'cancelled'`,
      [id, userId]
    );

    if (order.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found or already cancelled" });
    }

    // Restore stock for each item
    const items = await client.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [id]
    );

    for (const item of items.rows) {
      if (item.product_id) {
        await client.query(
          "UPDATE products SET stock = stock + $1 WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }
    }

    const result = await client.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    await client.query("COMMIT");
    console.log(`[cancelOrder] success — order ${id} cancelled`);
    res.json({ message: "Order cancelled", order: result.rows[0] });
  } catch (error) {
    console.error("[cancelOrder] error:", error.message);
    if (began) await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// GET USER ORDERS
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ORDER BY ID
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const items = await pool.query(
      `SELECT order_items.product_id,
              COALESCE(products.name, '(Product removed)') AS name,
              order_items.quantity,
              order_items.price
       FROM order_items
       LEFT JOIN products ON order_items.product_id = products.id
       WHERE order_items.order_id = $1`,
      [id]
    );

    res.json({ order: order.rows[0], items: items.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkout, payOrder, cancelOrder, getOrders, getOrderById };
