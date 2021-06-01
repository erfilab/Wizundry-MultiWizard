const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');
const { checkIfAuthenticated } = require("../controllers/middleware/auth");

UserRoute.get('/login', checkIfAuthenticated,
    async (req, res) => res.status(200).json({message: 'Signed In'}))


module.exports = UserRoute