const LogRoute = require('express').Router();
const LogController = require('../controllers/api/LogController');

LogRoute.post('/multidoc', LogController.createMultiDocLog);
LogRoute.get('/multdocs:query_time', LogController.listMultiDocLogs)

module.exports = LogRoute;