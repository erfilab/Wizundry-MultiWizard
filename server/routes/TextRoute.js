const TextRoute = require('express').Router();
const TextController = require('../controllers/api/TextController');

TextRoute.post('/behavior', TextController.createBehavior)
TextRoute.post('/create', TextController.create)
TextRoute.get('/index', TextController.listAllTexts)

module.exports = TextRoute;
