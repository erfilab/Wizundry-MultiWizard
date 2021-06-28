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

Text.getAll = ({query_time}, result) => {
    sql.query(`SELECT * FROM text_data WHERE text_data.timestamp >= ${query_time} AND text_data.timestamp < ${parseInt(query_time)+86400000}`,
        (err, res) => {
        if (err) {
            console.error(err)
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Text.getAllBehaviors = ({query_time}, result) => {
    sql.query(`SELECT * FROM behavior_log WHERE behavior_log.timestamp >= ${query_time} AND behavior_log.timestamp < ${parseInt(query_time)+86400000}`,
        (err, res) => {
            if (err) {
                console.error(err)
                result(null, err);
                return;
            }
            result(null, res);
        });
};

Text.getAllAnchors = ({query_time}, result) => {
    sql.query(`SELECT * FROM anchor_log WHERE anchor_log.timestamp >= ${query_time} AND anchor_log.timestamp < ${parseInt(query_time)+86400000}`,
        (err, res) => {
            if (err) {
                console.error(err)
                result(null, err);
                return;
            }
            result(null, res);
        });
};

Text.createBehav = ({ projectId, type, status, timestamp }, result) => {
    sql.query("INSERT INTO behavior_log SET ?", { projectId, type, status, timestamp }, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, { projectId, type, status, timestamp });
    });
}


Text.createAnchor = ({ projectId, clientX, clientY, innerHTML, anchor, timestamp }, result) => {
    sql.query("INSERT INTO anchor_log SET ?", { projectId, clientX, clientY, innerHTML, anchor, timestamp }, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, { projectId, clientX, clientY, innerHTML, anchor, timestamp });
    });
}

module.exports = Text;
