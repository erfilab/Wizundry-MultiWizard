const UserRoute = require('express').Router();
const UserController = require('../controllers/api/UserController');
const {checkIfAdmin} = require("../controllers/middleware/auth");

UserRoute.post('/loginEP', UserController.loginUser)
UserRoute.post('/upgrade', UserController.upgradeUser)
UserRoute.get('/loginTK', UserController.loginWithToken)
UserRoute.post('/create', UserController.create)

module.exports = UserRoute



// UserRoute.get('/login', async (req, res, next) => {
//         await checkIfAuthenticated(req, res, next, (err, data) => {
//             console.log("DATA", err, data)
//             if (err) return res.status(404).json({message: 'QQ'});
//             return res.status(200).json({data: data})
//         })
//     },
// )