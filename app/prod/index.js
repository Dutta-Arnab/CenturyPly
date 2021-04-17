const express = require("express");
const app = express();
const router = express.Router();

const {findAllLOB, findAllBranches, findAllProducts}= require('../prod/ctrl')

router.get('/LOB', findAllLOB);

router.get('/branches', findAllBranches);

router.post('/products', findAllProducts);

module.exports = router







