const sql = require("./db.js");

// constructor
const Text = function(text) {
    this.type = text.type;
    this.lastContent = text.lastContent;
    this.newContent = text.newContent;
    this.projectId = text.projectId;
    this.projectName = text.projectName;
    this.username = text.username;
    this.userRole = text.userRole;
    this.timestamp = text.timestamp;
};

Text.create = ({type, lastContent, newContent, projectId, projectName, username, userRole, timestamp}, result) => {
    sql.query("INSERT INTO text_data SET ?", {type, lastContent, newContent, projectId, projectName, username, userRole, timestamp}, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, {type, lastContent, newContent, projectId, projectName, username, userRole, timestamp});
    });
}

Text.getAll = result => {
    sql.query("SELECT * FROM text_data", (err, res) => {
        if (err) {
            console.error(err)
            result(null, err);
            return;
        }
        result(null, res);
    });
};


module.exports = Text;