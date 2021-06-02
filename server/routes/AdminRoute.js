const UserRoute = require('express').Router();
const AdminController = require('../controllers/api/UserController');
const { checkIfAuthenticated, checkIfAdmin } = require("../controllers/middleware/auth");

UserRoute.get('/', checkIfAuthenticated, checkIfAdmin,
    async (req, res) => res.status(200).json({message: 'Signed In'}))


module.exports = UserRoute