const Project = require('../../models/project');

exports.listAllProjects = (req, res) => {
    Project.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving projects."
            });
        else res.status(200).json({data: data});
    })
}