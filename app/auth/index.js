const express = require("express");
const app = express();
const router = express.Router();
const { logIn, verifyMail, setNewPass } = require('../auth/ctrl');

router.get('/verifymail', verifyMail);

router.post('/verifyotp', setNewPass);

router.post('/login', logIn);

module.exports = router