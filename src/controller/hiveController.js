// controllers/hiveController.js
const Hive = require('../model/Hive');
const BeekeeperModel = require('../model/beekeeper.model');
const tryCatch = require("../utils/TryCatch");
const sendEmail = require('../utils/sendEmail'); // adjust the path if needed
const Recommendation = require('../model/Recommendation');

// Get all hives for logged-in user
exports.getMyHives = tryCatch(async (req, res) => {
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
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    
    if (!beekeeper) {
      return res.status(404).json({ 
        status: false, 
        statusCode: 404,
        msg: "Beekeeper not found" 
      });
    }

    // Find hives associated with this beekeeper using the beekeeper ObjectId
    const hives = await Hive.find({ beekeeper: beekeeper._id })
      .populate('beekeeper', 'firstName lastName email username')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ 
      status: true, 
      statusCode: 200,
      msg: "Hives retrieved successfully",
      data: hives,
      count: hives.length 
    });

  } catch (error) {
    console.error('Error fetching hives:', error);
    res.status(500).json({ 
      status: false, 
      statusCode: 500,
      msg: "Internal server error",
      error: error.message 
    });
  }
});


// Create new hive
exports.createHive = tryCatch(async (req, res) => {
    const hiveData = req.body;
    console.log(hiveData);
    
    // Check if user is authenticated
    if (!req.user) {
        const response = { statusCode: 401, msg: "Authentication required" };
        return res.status(401).send(response);
    }
    
    // Find beekeeper by username to get their details
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    
    if (!beekeeper) {
        const response = { statusCode: 404, msg: "Beekeeper not found" };
        return res.status(404).send(response);
    }
    
    // Extract beekeeper email (try multiple sources)
    const beekeeperEmail = req.user.email || beekeeper.email;

    const hiveId = await generateHiveId();
    
    // Create hive with beekeeper details
    const hive = new Hive({ 
        ...hiveData, 
        id: hiveId,  
        beekeeper: beekeeper._id,      
        beekeeperEmail: beekeeper.email,
        //id: generateUniqueHiveId() 
    });
    
    const savedHive = await hive.save();
    
    // Generate recommendation based on hive data
    const recommendationText = generateHiveRecommendation(hiveData);

    const recommendation = new Recommendation({
        hiveId: savedHive._id,
        beekeeperId: beekeeper._id,
        recommendations: recommendationText
    });
    await recommendation.save();
    
    // Send email notification to beekeeper (optional)
    await sendEmail(beekeeperEmail, 'Hive Created Successfully',
        `Dear ${beekeeper.firstName || 'Beekeeper'},
        
        Your hive has been created successfully!
        
        Hive Details:
        - Hive ID: ${savedHive._id}
        - Location: ${hiveData.location || 'Not specified'}
        
        Recommendation: ${recommendationText}
        
        Best regards,
        BeeHive Manager Team`);
    
    const response = { 
        statusCode: 201, 
        msg: "Hive created successfully", 
        data: {
            hiveId: savedHive._id,
            recommendation: recommendationText
        }
    };
    
    res.status(201).send(response);
});

// Helper function to generate recommendations based on hive data
const generateHiveRecommendation = (hiveData) => {
    let recommendations = [];
    
    // Colony Strength Analysis
    const strength = parseInt(hiveData.strength) || 5;
    if (strength <= 3) {
        recommendations.push("⚠️ Weak colony detected. Consider feeding with sugar syrup and monitor closely for queen issues.");
    } else if (strength >= 8) {
        recommendations.push("💪 Strong colony! Monitor for swarming behavior and ensure adequate space.");
    }
    
    // Queen Status Analysis
    if (hiveData.queenStatus === 'Not Present') {
        recommendations.push("🚨 URGENT: No queen detected. Immediate action required - introduce new queen or allow colony to requeen.");
    } else if (hiveData.queenStatus === 'Unknown') {
        recommendations.push("🔍 Queen status uncertain. Conduct thorough inspection to locate queen or signs of queen activity.");
    }
    
    // Brood Pattern Analysis
    if (hiveData.broodPattern === 'Spotty') {
        recommendations.push("⚠️ Spotty brood pattern may indicate queen issues, disease, or poor nutrition. Monitor closely.");
    } else if (hiveData.broodPattern === 'None') {
        recommendations.push("🚨 No brood pattern - check for queen presence and laying activity immediately.");
    }
    
    // Population Analysis
    const population = parseInt(hiveData.population) || 20000;
    if (population < 15000) {
        recommendations.push("📉 Low population. Consider combining with stronger colony or providing feeding support.");
    } else if (population > 50000) {
        recommendations.push("📈 High population. Prepare for possible swarming - add supers or consider splitting.");
    }
    
    // Honey Stores Analysis
    const honeyStores = parseInt(hiveData.honeyStores) || 5;
    if (honeyStores < 3) {
        recommendations.push("🍯 Low honey stores. Begin feeding program immediately, especially before winter.");
    } else if (honeyStores > 15) {
        recommendations.push("🍯 Excellent honey stores! Consider harvest timing and leave adequate winter stores.");
    }
    
    // Pest Level Analysis
    const pestLevel = parseInt(hiveData.pestLevel) || 0;
    if (pestLevel >= 7) {
        recommendations.push("🐛 High pest levels detected! Immediate treatment required to prevent colony collapse.");
    } else if (pestLevel >= 4) {
        recommendations.push("🐛 Moderate pest levels. Monitor closely and consider preventive treatments.");
    }
    
    // Disease Signs Analysis
    if (hiveData.diseaseSigns && hiveData.diseaseSigns.length > 0) {
        const diseases = hiveData.diseaseSigns;
        if (diseases.includes('Varroa Mites')) {
            recommendations.push("🦟 Varroa mites detected. Apply appropriate mite treatment and monitor mite levels regularly.");
        }
        if (diseases.includes('American Foulbrood') || diseases.includes('European Foulbrood')) {
            recommendations.push("🚨 CRITICAL: Foulbrood detected. Contact local bee inspector immediately - quarantine may be required.");
        }
        if (diseases.includes('Nosema')) {
            recommendations.push("🤢 Nosema detected. Improve ventilation, reduce moisture, and consider fumagillin treatment.");
        }
        if (diseases.includes('Wax Moths') || diseases.includes('Small Hive Beetles')) {
            recommendations.push("🪲 Hive pests detected. Strengthen colony, reduce hive space, and use appropriate traps.");
        }
    }
    
    // Location-based recommendations
    if (hiveData.location) {
        const location = hiveData.location.toLowerCase();
        if (location.includes('urban') || location.includes('city')) {
            recommendations.push("🏙️ Urban location: Ensure compliance with local regulations and maintain good neighbor relations.");
        }
        if (location.includes('windy') || location.includes('exposed')) {
            recommendations.push("💨 Exposed location: Provide windbreak and secure hive components properly.");
        }
    }
    
    // Treatment Analysis
    if (hiveData.treatments && hiveData.treatments.length > 0) {
        const recentTreatments = hiveData.treatments.filter(treatment => {
            const treatmentDate = new Date(treatment.applicationDate);
            const monthsAgo = (new Date() - treatmentDate) / (1000 * 60 * 60 * 24 * 30);
            return monthsAgo <= 3;
        });
        
        if (recentTreatments.length > 0) {
            recommendations.push("💊 Recent treatments applied. Monitor colony response and avoid honey harvest during withdrawal periods.");
        }
    }
    
    // General seasonal advice based on current date
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 3 && currentMonth <= 5) { // Spring
        recommendations.push("🌸 Spring season: Monitor for swarm cells, provide adequate space, and check food stores.");
    } else if (currentMonth >= 6 && currentMonth <= 8) { // Summer
        recommendations.push("☀️ Summer season: Ensure proper ventilation, monitor for honey flow, and maintain pest control.");
    } else if (currentMonth >= 9 && currentMonth <= 11) { // Fall
        recommendations.push("🍂 Fall season: Prepare for winter, reduce hive size, and ensure adequate food stores (20+ lbs honey).");
    } else { // Winter
        recommendations.push("❄️ Winter season: Minimize disturbances, ensure ventilation, and monitor entrance for debris.");
    }
    
    // Default recommendation if no specific issues found
    if (recommendations.length === 0) {
        recommendations.push("✅ Colony appears healthy! Continue regular inspections every 7-14 days during active season.");
    }
    
    return recommendations.join('\n\n');
};

// Update hive
exports.updateHive = tryCatch(async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        status: false,
        statusCode: 401, 
        msg: "Authentication required" 
      });
    }

    // Find beekeeper
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Beekeeper not found" 
      });
    }

    // Find and update hive, ensuring it belongs to the current beekeeper
    const hive = await Hive.findOneAndUpdate(
      { _id: req.params.id, beekeeper: beekeeper._id }, // Ensure ownership
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('beekeeper', 'firstName lastName email username');

    if (!hive) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Hive not found or access denied" 
      });
    }

    res.status(200).json({ 
      status: true, 
      statusCode: 200,
      msg: "Hive updated successfully",
      data: hive 
    });
  } catch (error) {
    console.error('Error updating hive:', error);
    res.status(400).json({ 
      status: false,
      statusCode: 400,
      msg: "Error updating hive",
      error: error.message 
    });
  }
});

// Get single hive
exports.getHive = tryCatch(async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        status: false,
        statusCode: 401, 
        msg: "Authentication required" 
      });
    }

    // Find beekeeper
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Beekeeper not found" 
      });
    }

    // Find hive ensuring it belongs to the current beekeeper
    const hive = await Hive.findOne({ 
      _id: req.params.id, 
      beekeeper: beekeeper._id 
    }).populate('beekeeper', 'firstName lastName email username');

    if (!hive) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Hive not found or access denied" 
      });
    }

    res.status(200).json({ 
      status: true, 
      statusCode: 200,
      msg: "Hive retrieved successfully",
      data: hive 
    });
  } catch (error) {
    console.error('Error fetching hive:', error);
    res.status(500).json({ 
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message 
    });
  }
});

// Delete hive
exports.deleteHive = tryCatch(async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        status: false,
        statusCode: 401, 
        msg: "Authentication required" 
      });
    }

    // Find beekeeper
    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Beekeeper not found" 
      });
    }

    // Find and delete hive, ensuring it belongs to the current beekeeper
    const hive = await Hive.findOneAndDelete({ 
      _id: req.params.id, 
      beekeeper: beekeeper._id 
    });

    if (!hive) {
      return res.status(404).json({ 
        status: false,
        statusCode: 404, 
        msg: "Hive not found or access denied" 
      });
    }

    res.status(200).json({ 
      status: true, 
      statusCode: 200,
      msg: "Hive deleted successfully",
      data: { deletedHiveId: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting hive:', error);
    res.status(500).json({ 
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message 
    });
  }
});

const generateHiveId = async () => {
  // Find the hive with the highest ID
  const lastHive = await Hive.findOne().sort({ id: -1 });
  let nextNumber = 1;

  if (lastHive?.id) {
    // Extract numeric part and increment
    const lastNumber = parseInt(lastHive.id.replace('H', ''), 10);
    nextNumber = lastNumber + 1;
  }

  // Format to 4 digits with leading zeros
  return `H${nextNumber.toString().padStart(4, '0')}`;
};

module.exports = exports;