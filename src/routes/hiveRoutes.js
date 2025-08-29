// routes/hiveRoutes.js
const express = require('express');
const {
  getMyHives,
  createHive,
  updateHive,
  getHive
} = require('../controller/hiveController');
const auth = require("../middlewares/auth");

const router = express.Router();

router.get('/my-hives', auth , getMyHives);
router.post("/", auth, createHive);
router.put('/:id', auth,  updateHive);
router.get('/:id',auth, getHive);


module.exports = router;