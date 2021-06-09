const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');

UserRoute.get('/loginTK', UserController.loginWithToken)
UserRoute.get('/index', UserController.listAllUsers)
UserRoute.get('/:uid', UserController.loginUser)

UserRoute.post('/upgrade', UserController.upgradeUser)
UserRoute.post('/create', UserController.create)

module.exports = UserRoute
