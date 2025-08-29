// controllers/passengerController.js
const tryCatch = require("../utils/TryCatch");
const {Request, Response} = require("express");
const {StandardResponse} = require("../dto/StandardResponse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {Beekeeper} = require("../types/SchemaTypes");
const BeekeeperModel = require('../model/beekeeper.model');
const validator = require('validator');
const sendEmail = require('../utils/sendEmail'); 
const otpGenerator = require('otp-generator');

// Add a new field to the Passenger schema for storing OTP and OTP expiry
const OTP_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes




exports.login = tryCatch(async (req, res) => {
  const { username, password } = req.body;

    const beekeeper = await BeekeeperModel.findOne({ username});
    console.log(beekeeper);

    if (!beekeeper) {
      return res.status(400).json({ error: 'User not registered.' });
    }

    if (beekeeper.isActive === false) {
      return res.status(403).json({ error: 'You are deactivated. Please check your email.' });
    }

    const isPasswordValid = await bcrypt.compare(password, beekeeper.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: beekeeper.no, username: beekeeper.username, email: beekeeper.email }, process.env.KEY, { expiresIn: '3h' ,});
   
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });

    return res.status(200).json({ status: true, message: 'Logged in successfully' , token: token, data: beekeeper});
  
});



exports.forgotPassword = tryCatch(async (req, res) => {
  const { email } = req.body;

  const beekeeper = await BeekeeperModel.findOne({ email });
  if (!beekeeper) {
    return res.status(400).json({ message: 'Driver not registered.' });
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  // Set OTP and OTP expiry time
  beekeeper.otp = otp;
  beekeeper.otpExpiry = Date.now() + OTP_EXPIRY_TIME;
  await beekeeper.save();

  // Send OTP to email
  await sendEmail(email, 'Reset Password OTP', `
    Dear ${beekeeper.firstName}, 
    
    Use the following OTP to reset your password: ${otp}
    OTP is valid for 15 minutes.
    
    Best regards,
    BeeHive Manager Team`);

  return res.status(200).json({ status: true, message: 'OTP sent to email' });
});

exports.resetPassword = tryCatch(async (req, res) => {
  const { email, otp, password } = req.body;

  const beekeeper = await BeekeeperModel.findOne({ email });

  if (!beekeeper) {
    return res.status(400).json({ error: 'Driver not found' });
  }

  // Check if OTP is valid and not expired
  if (beekeeper.otp !== otp || beekeeper.otpExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 10);
  beekeeper.password = hashedPassword;
  beekeeper.otp = undefined; // Clear OTP
  beekeeper.otpExpiry = undefined; // Clear OTP expiry
  await beekeeper.save();

  return res.status(200).json({ status: true, message: 'Password reset successfully' });
});


exports.verify = tryCatch(async (req, res) => {
    return res.json({ status: true, message: "User is verified" });
});


exports.logout = tryCatch(async(req, res) => {
  // Implement session destruction or token invalidation logic as needed.
  //return res.json({ status: true, message: 'Logged out successfully' });
  return res.status(204).json({ status: true, message: 'Logged out successfully.' });
});




// Get Passenger by ID
exports.getBeekeeperByEmail = tryCatch(async (req, res) => {
  const { email } = req.params;
  console.log('Received request to fetch beekeeper by email: ${email}');

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const beekeeper = await BeekeeperModel.findOne({ email });
  console.log('Beekeeper: ${beekeeper}');
  if (!beekeeper) {
    const errorResponse = { statusCode: 400, msg: 'Beekeeper with email ${email} not found!' };
    return res.status(404).json(errorResponse);
  }

  const response = { statusCode: 200, msg: "OK", data: beekeeper};
  res.status(200).send(response);
});


// Update Passenger
exports.updateBeekeeper = tryCatch(async (req, res) => {
  const { email } = req.params;
  const updateFields = {};

  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    updateFields.email = req.body.email;
  }
  if (req.body.firstName) updateFields.firstName = req.body.firstName;
  if (req.body.lastName) updateFields.lastName = req.body.lastName;
  if (req.body.nicNo) updateFields.nicNo = req.body.nicNo;
  if (req.body.gender) {
    if (!['Male', 'Female', 'Other'].includes(req.body.gender)) {
      return res.status(400).json({ error: 'Invalid gender' });
    }
    updateFields.gender = req.body.gender;
  }
  if (req.body.dateOfBirth) updateFields.dateOfBirth = new Date(req.body.dateOfBirth);
  if (req.body.contactNo) {
    if (!/^\d{10}$/.test(req.body.contactNo)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    updateFields.contactNo = req.body.contactNo;
  }
  if (req.body.serviceNo) updateFields.serviceNo = req.body.serviceNo;
  if (typeof req.body.isInternal !== 'undefined') {
    updateFields.isInternal = req.body.isInternal;
  }
  if (req.body.isInternal && req.body.companyName) {
    updateFields.companyName = req.body.companyName;
  }

  if (req.body.password) {
    if (!validator.isStrongPassword(req.body.password)) {
      return res.status(400).json({ error: 'Password does not meet strength requirements' });
    }
    updateFields.password = await bcrypt.hash(req.body.password, 10);
  }

  try {
    const passenger = await PassengerModel.findOneAndUpdate(
      { email},
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    return res.status(200).json({ status: true, message: 'Passenger updated successfully', data: passenger });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});