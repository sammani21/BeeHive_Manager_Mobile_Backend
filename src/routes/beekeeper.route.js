const express = require("express");
const { Router } = require("express");
const {login, logout, forgotPassword, resetPassword, verify, getBeekeeperByEmail } = require('../controller/beekeeper.controller');
const verifyUser = require('../middlewares/verifyUser'); 

const router = Router();


router.post('/login', login);
router.get('/logout', logout);
router.post('/fpassword', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/verify", verifyUser, verify);

router.get('/:email', getBeekeeperByEmail);


module.exports = router;
