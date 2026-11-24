import Order from "../models/order.model.js";
import generateOrderId from "../utils/generateOrderId.js";

// Create Order
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      items,
      shippingAddress,
      shippingCharge = 0,
      paymentMethod = "COD",
      note,
    } = req.body;

    if (
      !customer?.name ||
      !customer?.phone ||
      !shippingAddress?.address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required order information is missing",
      });
    }

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product information",
        });
      }
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const total = subtotal + shippingCharge;

    const order = await Order.create({
      orderId: generateOrderId(),
      customer,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Orders
export const getAllOrders = async (req, res, next) =>  {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Order
export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { orderStatus },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Order
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndDelete({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};