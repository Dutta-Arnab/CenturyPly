const express = require("express");
const app = express();
const router = express.Router();
const {isLoggedIn, isAdmin}= require('../middleware/permision')

const {createUser, updateUser, findAllUser, findUserById, updateStatus}=require('../user/ctrl')

//create a new user
router.post('/',isLoggedIn, isAdmin, createUser);

//update user with id
router.put('/:id', updateUser);

//update active/deactive user with id
router.put('/status/:id', updateStatus);

// Retrieve all user
router.get('/', findAllUser);

// Retrieve a single user with id
router.get('/:id', findUserById);

module.exports = router