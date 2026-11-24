import express from "express";
import cors from "cors";

import orderRoutes from "./routes/order.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://shocks.dailyhutbd.com"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Order Server is Running");
});

// Order API
app.use("/api/orders", orderRoutes);

// Error handler
app.use(errorHandler);

export default app;