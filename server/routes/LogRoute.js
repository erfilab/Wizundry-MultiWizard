const LogRoute = require('express').Router();
const LogController = require('../controllers/api/LogController');

LogRoute.post('/multidoc', LogController.createMultiDocLog);
LogRoute.get('/multidoc', LogController.listMultiDocLogs);

module.exports = LogRoute;