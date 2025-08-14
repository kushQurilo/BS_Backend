const mongoose = require("mongoose");
// Schema for product variants
const variantSchema = new mongoose.Schema({
  price: { type: Number, required: true, min: 1 },
  quantity: { type: Number, required: true, min: 1 },
});
const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: [true, "price is required"],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "categoryId is required"],
    ref: "Category",
  },
  variants: { type: [variantSchema], default: [] },
  description: {
    type: String,
  },
  carter: {
    type: Number,
    default: 0,
  },
  isFeature: {
    type: Boolean,
    default: false,
  },
  images: {
    type: [String],
    default: [],
  },
  points: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Product", productSchema);
