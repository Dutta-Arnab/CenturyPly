const express = require("express");
const app = express();
const router = express.Router();

const {data}=require('../data/ctrl')
const {isLoggedIn}=require('../middleware/permision')

router.get("/", isLoggedIn, data);

module.exports=router;