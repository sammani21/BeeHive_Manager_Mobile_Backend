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

  description: { type: String }, 

  quantity: { type: Number, required: true }, 

  unit: { 
    type: String, 
    enum: ["kg", "g", "liters", "ml", "pieces"], 
    default: "kg" 
  },

  price: { type: Number, required: true }, 

  harvestDate: { type: Date, required: true }, 

  expiryDate: { type: Date }, 

  qualityGrade: { 
    type: String, 
    enum: ["Premium", "Standard", "Organic", "Unspecified"], 
    default: "Unspecified" 
  },

  originLocation: { type: String }, 

  
  moistureContent: { type: Number }, 
  waxColor: { type: String }, 
  pollenSource: { type: String }, 
  
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
