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
    Text.getAll((err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
        else res.status(200).json({data: data});
    })
}