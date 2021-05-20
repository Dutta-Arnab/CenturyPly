const express = require("express");
const app = express();
const router = express.Router();

const {logIn}=require('../logIn/ctrl')

router.get('/',logIn)

module.exports = router