const ExperimentRoute = require('express').Router();
const ExperimentController = require('../controllers/api/ExperimentController');


ExperimentRoute.get('/', ExperimentController.listAllExperiments);
ExperimentRoute.post('/', ExperimentController.createExperiment);
ExperimentRoute.get('/:id', ExperimentController.getExperimentById);
ExperimentRoute.delete('/:id', ExperimentController.deleteExperiment);

module.exports = ExperimentRoute;