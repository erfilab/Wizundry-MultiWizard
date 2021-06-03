const User = require("../../models/user.js");
const Project = require('../../models/project');
const firebaseAdmin = require('../../config/firebase');

exports.loginUser = async (req, res) => {
    let {uid, email, username, role, createdAt} = req.body;
    createdAt = new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ');
    User.addLoginLog({uid, email, username, role, createdAt}, async (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while login the User"
            });
        else {
            await firebaseAdmin.auth().setCustomUserClaims(uid, {role: role, name: name})
            return res.status(200).json({data: data})
        }
    })
}

exports.upgradeUser = async (req, res) => {
    const { uid } = req.body;
    await firebaseAdmin.auth().setCustomUserClaims(uid, {role: 'admin'})
    return res.status(200).send({uid});
}

exports.loginWithToken = async (req, res) => {
    if ( req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else req.authToken = null;

    try {
        const { authToken } = req;
        const userInfo = await firebaseAdmin
            .auth()
            .verifyIdToken(authToken);
        req.authId = userInfo.uid;
        return res.status(200).json({data: userInfo});
    } catch (e) {
        return res
            .status(401)
            .send({ error: 'You are not authorized to make this request' });
    }
}

// Create and Save a new Customer
exports.create = async (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    let {userInfo, projectInfo} = req.body;

    let {email, password, username, role, createdAt} = userInfo;
    // createdAt = firebaseAdmin.firestore.Timestamp.fromDate(new Date())
    createdAt = new Date(createdAt).getTime();
    const user = await firebaseAdmin.auth().createUser({email, password, username, role, createdAt});
    const { uid } = user;
    User.create({uid, email, password, username, role, createdAt}, async (err, data) => {
        if (err)
            res.status(500).send({message: err.message || "Some error occurred while create the User"});
        else {
            // await firebaseAdmin.auth().setCustomUserClaims(uid, {role: role})
            let { project_name, creator, participant, createdAt } = projectInfo;
            createdAt = new Date(createdAt).getTime();
            console.log(createdAt)
            Project.create({ project_name, creator, participant, createdAt }, async (err, data) => {
                if (err) res.status(500).send({message: err.message || "Some error occurred while create the project"});
                else console.log("Project>>>", data);
            })
        }
    })

    res.status(201).json({data: {user: user, project: projectInfo}});
};

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