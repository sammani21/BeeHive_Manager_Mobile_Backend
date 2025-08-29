// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');
const auth = require('../middlewares/auth');

router.get('/my-recommendations', auth, recommendationController.getMyRecommendations);

module.exports = router;