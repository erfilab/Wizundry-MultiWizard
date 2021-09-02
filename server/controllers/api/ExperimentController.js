const Experiment = require('../../models/experiment');

exports.createExperiment = async (req, res) => {
    if (!req.body) res.status(400).send({ message: "Content can not be empty!" });

    Experiment.create({ ...req.body }, async (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while create the experiment" });
        else res.status(201).json({ data: data });
    })
};

exports.listAllExperiments = (req, res) => {
    Experiment.getAll((err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving Experiments Data" });
        else res.status(200).json({ data: data });
    })
}

exports.getExperimentById = (req, res) => {
    if (!req.params.id) res.status(400).send({ message: "Id can not be empty!" });

    Experiment.getById(req.params.id, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while retrieving Experiments Data" });
        else res.status(200).json({ data: data });
    })
}

exports.deleteExperiment = (req, res) => {
    Experiment.deleteById(req.params.id, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Some error occurred while deleting the experiment" });
        else res.status(200).json({ data: data });
    })
}