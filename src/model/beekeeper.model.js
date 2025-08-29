const { model, Schema } = require("mongoose");

const beekeeperSchema = new Schema({
    no: {
        type: String,
        
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    nic: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
    },
    dob: {
        type: Date,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    availability: {
        type: Boolean,
        default: true
    },

    otp: {
        type: String,
        default: null,
      },
      otpExpires: {
        type: Date,
        default: null,
      },
    
}, { timestamps: true });

const BeekeeperModel = model("Beekeeper", beekeeperSchema);

module.exports = BeekeeperModel;
