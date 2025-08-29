// model/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  hiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true
  },
  beekeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
    required: true
  },
  recommendations: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);