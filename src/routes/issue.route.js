
const express = require('express');
const { createIssue } = require('../controller/issue.controller');

const router = express.Router();


router.post('/', createIssue);

module.exports = router;
