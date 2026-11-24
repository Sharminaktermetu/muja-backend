import express from "express";

import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:orderId", getSingleOrder);
router.patch("/:orderId/status", updateOrderStatus);
router.delete("/:orderId", deleteOrder);

export default router;