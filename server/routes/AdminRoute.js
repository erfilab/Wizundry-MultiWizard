const UserRoute = require('express').Router();
const AdminController = require('../controllers/api/UserController');
const { checkIfAdmin } = require("../controllers/middleware/auth");

UserRoute.get('/', checkIfAdmin,
    async (req, res) => res.status(200).json({message: 'Signed In'}))


module.exports = UserRoute