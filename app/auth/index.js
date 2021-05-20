const express = require("express");
const app = express();
const router = express.Router();
const { logIn, mail, otpPass } = require('../auth/ctrl');

router.post('/', logIn);

router.get('/', mail);

router.post('/otp', otpPass);

module.exports = router