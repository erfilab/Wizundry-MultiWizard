const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');

UserRoute.post('/loginEP', UserController.loginUser)
UserRoute.post('/upgrade', UserController.upgradeUser)
UserRoute.get('/loginTK', UserController.loginWithToken)
UserRoute.post('/create', UserController.create)
UserRoute.get('/index', UserController.listAllUsers)

module.exports = UserRoute