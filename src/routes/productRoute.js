// routes/productRoutes.js
const express = require("express");
const {
  getMyProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  downloadReport
} = require("../controller/insightController");
const auth = require("../middlewares/auth");

const router = express.Router();

// Get all products of logged-in beekeeper
router.get("/my-products", auth, getMyProducts);

// Create new product
router.post("/", auth, createProduct);

// Update product by ID
router.put("/:id", auth, updateProduct);

// Download report route BEFORE the ":id" route
router.get("/download-report", auth, downloadReport);

// Keep your normal product ID route
router.get("/:id", auth, getProduct);

// // Get single product by ID
// router.get("/:id", auth, getProduct);

// Delete product by ID
router.delete("/:id", auth, deleteProduct);

module.exports = router;
