const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { checkout, payOrder, cancelOrder, getOrders, getOrderById } = require("../controllers/orderController");

router.post("/checkout", protect, checkout);
router.post("/pay", protect, payOrder);
router.post("/cancel", protect, cancelOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
