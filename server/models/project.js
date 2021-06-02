const sql = require("./db.js");

// constructor
const Project = function(project) {
    this.name = project.name;
    this.creator = project.creator;
    this.participant = project.participant;
    this.createdAt = project.createdAt;
};

Project.create = ({ name, creator, participant, createdAt }, result) => {
    sql.query("INSERT INTO project_info SET ?", { name, creator, participant, createdAt}, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, { name, creator, participant, createdAt });
    });
}


module.exports = Project;