const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');
const {checkIfAuthenticated} = require("../controllers/middleware/auth");

UserRoute.post('/loginEP', UserController.loginUser)
UserRoute.post('/upgrade', UserController.upgradeUser)


UserRoute.get('/loginTK', async (req, res, next) => {
        await checkIfAuthenticated(req, res, next, (err, data) => {
            console.log("DATA", data)
            if (err) return res.status(404).json(err);
            return res.status(200).json({data: data})
        })
    },
)

module.exports = UserRoute