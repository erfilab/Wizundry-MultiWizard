const TextRoute = require('express').Router();
const TextController = require('../controllers/api/TextController');

TextRoute.post('/behavior', TextController.createBehavior)
TextRoute.post('/anchor', TextController.createAnchor)
TextRoute.get('/behaviors:query_time', TextController.listAllBehaviors)
TextRoute.post('/create', TextController.create)
TextRoute.get('/index:query_time', TextController.listAllTexts)

module.exports = TextRoute;
