const pool = require("../config/db");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      image_url,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
      (name,description,price,stock,category,image_url)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        name,
        description,
        price,
        stock,
        category,
        image_url,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT *
       FROM products
       ORDER BY id DESC
       LIMIT $1
       OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
// SEARCH PRODUCTS
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `SELECT *
       FROM products
       WHERE name ILIKE $1`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      stock,
      category,
      image_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET
       name = $1,
       description = $2,
       price = $3,
       stock = $4,
       category = $5,
       image_url = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        description,
        price,
        stock,
        category,
        image_url,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};