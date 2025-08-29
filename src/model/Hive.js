const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  treatmentType: { type: String, required: true },
  applicationDate: { type: Date, required: true },
  notes: { type: String }
}, { _id: false });

const hiveSchema = new mongoose.Schema({
  beekeeper: { // updated from `no` for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
    required: true
  },
  hiveName: { type: String, required: true },
  hiveType: { type: String, required: true },
  installationDate: { type: Date, required: true },
  lastInspection: { type: Date, required: true },
  strength: { 
    type: Number, 
    min: 1, 
    max: 10,
    required: true
  },
  queenStatus: { 
    type: String, 
    enum: ['Present', 'Not Present', 'Unknown'],
    required: true
  },
  broodPattern: { 
    type: String, 
    enum: ['Solid', 'Spotty', 'None', 'Other'],
    required: true
  },
  honeyStores: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true
  },
  pestLevel: { 
    type: Number, 
    min: 0, 
    max: 10,
    required: true
  },
  diseaseSigns: { 
    type: [String], 
    default: [] 
  },
  treatments: { 
    type: [treatmentSchema], 
    default: [] 
  },
  location: { type: String, required: true },
  population: { type: Number, min: 0, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Hive', hiveSchema);
