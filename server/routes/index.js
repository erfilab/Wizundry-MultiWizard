const routes = require('express').Router();
const UserRoute = require('./UserRoute');
const AdminRoute = require('./AdminRoute');

routes.use('/user', UserRoute);
routes.use('/admin', AdminRoute);

routes.get('/', (req, res) => {
    res.status(200).json({message: 'Connected to API'})
})

module.exports = routes;