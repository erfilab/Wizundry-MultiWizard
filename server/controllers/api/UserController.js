const User = require("../../models/user.js");
const Project = require('../../models/project');
// const firebaseAdmin = require('../../config/firebase');

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const rand=()=>Math.random(0).toString(36).substr(2);
const genToken=(length)=>(rand()+rand()+rand()+rand()).substr(0,length);


exports.loginWithPassword = async (req, res) => {
    if (!req.body) {
        res.status(400).send({
            status: 400,
            message: "Content can not be empty!",
            data: null
        });
    }
    let { username, password, roles } = req.body;
    
    //check if db already exists this username
    await User.getByUsername(username, async (err, data) => {
        if (err) {
            res.status(500).send({
                status: 500,
                data: null,
                message: err.message || "Some error occurred while retrieving data."
            });
        } else {
            if (data.length > 0) {
                if (password === data[0].password) {
                    res.status(200).json({
                        status: 200,
                        message: "Login successfully",
                        data: {...data[0], roles: JSON.stringify(roles)}
                    });
                } else {
                    res.status(401).send({
                        status: 401,
                        message: "Password is incorrect",
                        data: null
                    });
                }
            } else {
                const uid = uuidv4();
                const token = genToken(32);
                const createdAt = new Date().valueOf();
                roles = JSON.stringify(roles);
                await User.create({ uid, password, username, roles, token, createdAt }, async (err, data) => {
                    if (err) res.status(500).send({ 
                        status: 500,
                        message: err.message || "Some error occurred while create the User",
                        data: null
                    });
                    res.status(201).json({
                        status: 201,
                        data: { uid, password, username, roles, token, createdAt },
                        message: "User created successfully."
                    });
                })
            }
        }
    })
}

// exports.upgradeUser = async (req, res) => {
//     const {uid} = req.body;
//     await firebaseAdmin.auth().setCustomUserClaims(uid, {role: 'admin'})
//     return res.status(200).send({uid});
// }

// exports.loginWithToken = async (req, res) => {
//     if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//         req.authToken = req.headers.authorization.split(' ')[1];
//     } else req.authToken = null;

//     try {
//         const {authToken} = req;
//         const userInfo = await firebaseAdmin
//             .auth()
//             .verifyIdToken(authToken);
//         req.authId = userInfo.uid;
//         return res.status(200).json({data: userInfo});
//     } catch (e) {
//         return res
//             .status(401)
//             .send({error: 'You are not authorized to make this request'});
//     }
// }


exports.listAllUsers = (req, res) => {
    User.getAll((err, data) => {
        console.log(data)
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.status(200).json({data: data});
    })
}
