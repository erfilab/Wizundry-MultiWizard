const Text = require("../../models/text.js");

exports.create = async (req, res) => {
    if (!req.body) res.status(400).send({ message: "Content can not be empty!" });

    let {type, lastContent, newContent, projectId, projectName, username, userRole, timestamp} = req.body;
    Text.create({type, lastContent, newContent, projectId, projectName, username, userRole, timestamp}, async (err, data) => {
        if (err) res.status(500).send({message: err.message || "Some error occurred while create the Text Data"});
        else res.status(201).json({data: data});
    })
};

exports.listAllTexts = (req, res) => {
    const { query_time } = req.params;
    Text.getAll({query_time}, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving text data." });
        else res.status(200).json({data: data});
    })
}

exports.createBehavior = (req, res) => {
    if (!req.body) res.status(400).send({ message: "Content can not be empty!" });

    let { projectId, type, status, timestamp } = req.body;
    Text.createBehav({ projectId, type, status, timestamp }, async (err, data) => {
        if (err) res.status(500).send({message: err.message || "Some error occurred while create the Behavior"});
        else res.status(201).json({data: data});
    })
}

exports.createAnchor = (req, res) => {
    if (!req.body) res.status(400).send({ message: "Content can not be empty!" });

    let { projectId, clientX, clientY, innerHTML, anchor, timestamp } = req.body;
    Text.createAnchor({ projectId, clientX, clientY, innerHTML, anchor, timestamp }, async (err, data) => {
        if (err) res.status(500).send({message: err.message || "Some error occurred while create the Anchor"});
        else res.status(201).json({data: data});
    })
}

exports.listAllBehaviors = (req, res) => {
    const { query_time } = req.params;
    Text.getAllBehaviors({query_time}, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving behaviors." });
        else res.status(200).json({data: data});
    })
}
