const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  beekeeper: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Beekeeper", 
    required: true 
  },

  productName: { type: String, required: true }, // e.g. "Raw Honey", "Pure Beeswax"

  productType: { 
    type: String, 
    enum: ["Honey", "Beeswax", "Propolis", "Royal Jelly", "Bee Pollen", "Other"], 
    required: true 
  },

  description: { type: String }, // Optional details about product

  quantity: { type: Number, required: true }, // numeric quantity

  unit: { 
    type: String, 
    enum: ["kg", "g", "liters", "ml", "pieces"], 
    default: "kg" 
  },

  price: { type: Number, required: true }, // per unit price

  harvestDate: { type: Date, required: true }, // when harvested

  expiryDate: { type: Date }, // optional, if perishable

  qualityGrade: { 
    type: String, 
    enum: ["Premium", "Standard", "Organic", "Unspecified"], 
    default: "Unspecified" 
  },

  originLocation: { type: String }, // location of harvest

  // Extra attributes depending on product type
  moistureContent: { type: Number }, // % moisture (for honey)
  waxColor: { type: String }, // for beeswax e.g. "yellow", "white"
  pollenSource: { type: String }, // e.g. "coconut", "mango flowers"
  
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
