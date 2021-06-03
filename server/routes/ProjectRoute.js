const ProjectRoute = require('express').Router();
const ProjectController = require('../controllers/api/ProjectController');

ProjectRoute.get('/index', ProjectController.listAllProjects);


module.exports = ProjectRoute