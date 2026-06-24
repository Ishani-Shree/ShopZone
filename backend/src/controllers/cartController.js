const pool = require("../config/db");

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { product_id, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO cart_items
      (user_id,product_id,quantity)
      VALUES($1,$2,$3)
      RETURNING *`,
      [userId, product_id, quantity]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        cart_items.id,
        products.name,
        products.price,
        cart_items.quantity
      FROM cart_items
      JOIN products
      ON cart_items.product_id = products.id
      WHERE cart_items.user_id = $1`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM cart_items
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({
      message: "Item removed from cart",
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
};