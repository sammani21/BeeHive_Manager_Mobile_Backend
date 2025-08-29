// controllers/recommendationController.js
const Recommendation = require('../model/Recommendation');
const tryCatch = require("../utils/TryCatch");

// Get recommendations for logged-in user
exports.getMyRecommendations = tryCatch(async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        status: false, 
        statusCode: 401,
        msg: "Authentication required" 
      });
    }

    // Find beekeeper by username
    const BeekeeperModel = require('../model/beekeeper.model');
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    
    if (!beekeeper) {
      return res.status(404).json({ 
        status: false, 
        statusCode: 404,
        msg: "Beekeeper not found" 
      });
    }

    // Find recommendations associated with this beekeeper
    const recommendations = await Recommendation.find({ beekeeperId: beekeeper._id })
      .populate('hiveId', 'hiveName location')
      .sort({ date: -1 }); // Sort by newest first

    res.status(200).json({ 
      status: true, 
      statusCode: 200,
      msg: "Recommendations retrieved successfully",
      data: recommendations,
      count: recommendations.length 
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      status: false, 
      statusCode: 500,
      msg: "Internal server error",
      error: error.message 
    });
  }
});