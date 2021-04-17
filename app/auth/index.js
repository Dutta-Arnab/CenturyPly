const express = require("express");
const app = express();
const router = express.Router();
const { logIn } = require('../auth/ctrl');

router.post('/', logIn);

module.exports = router