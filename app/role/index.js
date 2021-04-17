const express = require("express");
const app = express();
const router = express.Router();

const { createRole, findAllRole, findRoleById, updateRole, deleteRole } = require('../role/ctrl');
const { isAdmin, isLoggedIn } = require('../middleware/permision')

// Create a new Role
router.post('/', isLoggedIn, isAdmin, createRole);

// Retrieve all Role
router.get('/', isLoggedIn,findAllRole);

// Retrieve a single Role with id
router.get('/:id', isLoggedIn, findRoleById);

// Update a Role with id
router.put('/:id',isLoggedIn, updateRole);

// Delete a Role with id
router.delete('/:id',isLoggedIn, isAdmin, deleteRole);



module.exports = router