const Log = require('../../models/log');

exports.createMultiDocLog = async (req, res) => {
    if (!req.body) res.status(400).send({ message: "Content can not be empty!" });

    Log.create({...req.body }, async (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while create the Logs" });
        else res.status(201).json({ data: data });
    })
};

exports.listMultiDocLogs = (req, res) => {
    console.log({ ...req.query });
    Log.getAll({...req.query }, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving Logs Data" });
        else res.status(200).json({ data: data });
    })
}

exports.getMultiDocLogsById = (req, res) => {
    // console.log(req.params.id);
    Log.getMultiDocById(req.params.id, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving Logs Data" });
        else res.status(200).json({ data: data });
    })
}