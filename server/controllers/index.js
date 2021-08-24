const UserController = require("./api/UserController");
const AdminController = require('./api/AdminController')
const LogController = require('./api/LogController')

const AppControllers = {
    UserController,
    AdminController,
    LogController
};

module.exports = AppControllers;