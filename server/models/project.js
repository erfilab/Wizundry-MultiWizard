const sql = require("./db.js");

// constructor
const Project = function(project) {
    this.project_name = project.project_name;
    this.creator = project.creator;
    this.participant = project.participant;
    this.createdAt = project.createdAt;
};

Project.create = ({ project_name, creator, participant, createdAt }, result) => {
    sql.query("INSERT INTO project_info SET ?", { project_name, creator, participant, createdAt}, (err, res) => {
        if (err) {
            console.error(err);
            result(err, null);
            return;
        }

        result(null, { project_name, creator, participant, createdAt });
    });
}

Project.getAll = result => {
    sql.query("SELECT * FROM project_info", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};


module.exports = Project;
