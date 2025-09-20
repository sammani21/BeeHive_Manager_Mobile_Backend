const Product = require('../model/Product'); // Create Product model (see below)
const BeekeeperModel = require('../model/beekeeper.model');
const tryCatch = require("../utils/TryCatch");
const PDFDocument = require("pdfkit");

// Get all products for logged-in beekeeper
exports.getMyProducts = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    // find beekeeper
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    // find products
    const products = await Product.find({ beekeeper: beekeeper._id })
  .sort({ date: -1 });

    res.status(200).json({
      status: true,
      statusCode: 200,
      msg: "Products retrieved successfully",
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});


// Create new product
exports.createProduct = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    const {
      productName,
      productType,
      description,
      quantity,
      unit,
      price,
      harvestDate,
      qualityGrade,
      originLocation,
      moistureContent,
      waxColor,
      pollenSource
    } = req.body;

    // Validate required fields
    if (!productName || !quantity || !price || !unit) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        msg: "Missing required fields: productName, quantity, price, and unit are required"
      });
    }

    const product = new Product({
      productName,
      productType: productType || 'Honey',
      description: description || '',
      quantity,
      unit,
      price,
      harvestDate: harvestDate || new Date(),
      qualityGrade: qualityGrade || 'Unspecified',
      originLocation: originLocation || '',
      moistureContent,
      waxColor,
      pollenSource,
      beekeeper: beekeeper._id
    });

    const savedProduct = await product.save();

    // Generate marketing recommendations (update this function to handle new fields if needed)
    const recommendation = generateProductRecommendation(savedProduct);

    res.status(201).json({
      status: true,
      statusCode: 201,
      msg: "Product created successfully",
      data: {
        productId: savedProduct._id,
        recommendation
      }
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});


// Update product
exports.updateProduct = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, beekeeper: beekeeper._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Product not found or access denied"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      msg: "Product updated successfully",
      data: product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});


// Delete product
exports.deleteProduct = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      beekeeper: beekeeper._id
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Product not found or access denied"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      msg: "Product deleted successfully",
      data: { deletedProductId: req.params.id }
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});


// Marketing insights generator
const generateProductRecommendation = (product) => {
  const qty = parseInt(product.quantity) || 0;
  const month = new Date(product.harvestDate || product.date).getMonth() + 1;
  let tips = [];

  // Quantity-based recommendations
  if (qty > 100) {
    tips.push("📈 High production detected – consider expanding market reach.");
  } else if (qty < 20) {
    tips.push("📉 Low production – explore reasons such as hive health or season.");
  }

  // Seasonal recommendations
  if (month === 3 || month === 4) {
    tips.push("🌸 Spring trend: Honey demand usually increases – stock up.");
  }
  if (month === 12) {
    tips.push("🎄 Holiday season: Pack honey in gift sets for higher sales.");
  }

  // Product type specific recommendations
  if (product.productType === 'Honey') {
    tips.push("🍯 Honey products sell best when marketed with their floral source.");
    if (product.moistureContent && product.moistureContent < 18) {
      tips.push("✅ Excellent moisture content - this honey will have a longer shelf life.");
    } else if (product.moistureContent && product.moistureContent > 20) {
      tips.push("⚠️ Higher moisture content - consider proper storage to prevent fermentation.");
    }
  } else if (product.productType === 'Beeswax') {
    tips.push("🕯️ Beeswax is popular for candles and cosmetics - highlight purity in marketing.");
    if (product.waxColor) {
      tips.push(`🎨 The ${product.waxColor} color of your wax is attractive for craft projects.`);
    }
  } else if (product.productType === 'Propolis') {
    tips.push("🌿 Propolis has medicinal properties - market to health-conscious consumers.");
  } else if (product.productType === 'Royal Jelly') {
    tips.push("👑 Royal Jelly is a premium product - target specialty health stores.");
  } else if (product.productType === 'Bee Pollen') {
    tips.push("🌼 Bee pollen is a superfood - emphasize nutritional benefits in marketing.");
    if (product.pollenSource) {
      tips.push(`🌸 Your pollen from ${product.pollenSource} sources adds unique selling points.`);
    }
  }

  // Quality grade recommendations
  if (product.qualityGrade === 'Premium') {
    tips.push("⭐ Premium grade products can command higher prices - target specialty markets.");
  } else if (product.qualityGrade === 'Organic') {
    tips.push("🌱 Organic certification adds value - highlight in your marketing materials.");
  }

  // Origin-based recommendations
  if (product.originLocation) {
    tips.push(`🗺️ Highlight the unique terroir of ${product.originLocation} in your product story.`);
  }

  if (tips.length === 0) {
    tips.push("✅ Steady production – maintain current strategy.");
  }

  return tips.join("\n\n");
};

// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Special action (not a DB query)
    if (id === "download-report") {
      // custom logic
      return res.json({ message: "Report downloaded successfully" });
    }

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.downloadReport = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({ msg: "Beekeeper not found" });
    }

    const { month, year } = req.query;

    // If no year is provided, default to current year
    const selectedYear = parseInt(year) || new Date().getFullYear();
    let startDate, endDate, reportTitle, filename;

    if (month) {
      //  Monthly report
      const selectedMonth = parseInt(month);
      startDate = new Date(selectedYear, selectedMonth - 1, 1);
      endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

      reportTitle = `BeeHive Production Report - ${startDate.toLocaleString("default", { month: "long" })} ${selectedYear}`;
      filename = `report-${selectedYear}-${selectedMonth}.pdf`;
    } else {
      //  Yearly report
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

      reportTitle = `BeeHive Production Report - Year ${selectedYear}`;
      filename = `report-${selectedYear}.pdf`;
    }

    // Build query
    const query = {
      beekeeper: beekeeper._id,
      harvestDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const products = await Product.find(query).sort({ harvestDate: 1 });

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    // Report Header
    doc.fontSize(20).text("BeeHive Production Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(reportTitle, { align: "center" });
    doc.moveDown();

    // Report Body
    if (products.length === 0) {
      doc.fontSize(14).text("No products found for the selected period.");
    } else {
      products.forEach((p, i) => {
        doc.fontSize(12).text(
          `${i + 1}. ${p.productName} (${p.productType}) - ${p.quantity} ${p.unit} | Harvested: ${p.harvestDate.toDateString()}`
        );
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};