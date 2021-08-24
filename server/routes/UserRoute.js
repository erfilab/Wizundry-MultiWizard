const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');

// UserRoute.get('/loginTK', UserController.loginWithToken)
UserRoute.post('/login', UserController.loginWithPassword)
UserRoute.get('/index', UserController.listAllUsers)
// UserRoute.get('/:uid', UserController.loginUser)

// UserRoute.post('/upgrade', UserController.upgradeUser)

module.exports = UserRoute;
