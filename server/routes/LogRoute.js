const LogRoute = require('express').Router();
const LogController = require('../controllers/api/LogController');


LogRoute.get('/multdocs', LogController.listMultiDocLogs)
LogRoute.post('/multidoc', LogController.createMultiDocLog);
LogRoute.get('/multidocs/:id', LogController.getMultiDocLogsById);

module.exports = LogRoute;