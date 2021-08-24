const sql = require("./db.js");

// constructor
const Log = function () {
};

Log.create = (param, result) => {
    sql.query("INSERT INTO multi_doc_logs SET ?", { ...param }, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, { ...res.id, ...param });
    });
}

Log.getAll = ({ query_time }, result) => {
    sql.query(`SELECT * FROM multi_doc_logs WHERE multi_doc_logs.timestamp >= ${query_time} AND multi_doc_logs.timestamp < ${parseInt(query_time) + 86400000}`,
        (err, res) => {
            if (err) {
                console.error(err)
                result(null, err);
                return;
            }
            result(null, res);
        });
};

Log.getAllBehaviors = ({ query_time }, result) => {
    sql.query(`SELECT * FROM behavior_log WHERE behavior_log.timestamp >= ${query_time} AND behavior_log.timestamp < ${parseInt(query_time) + 86400000}`,
        (err, res) => {
            if (err) {
                console.error(err)
                result(null, err);
                return;
            }
            result(null, res);
        });
};

Log.getAllAnchors = ({ query_time }, result) => {
    sql.query(`SELECT * FROM anchor_log WHERE anchor_log.timestamp >= ${query_time} AND anchor_log.timestamp < ${parseInt(query_time) + 86400000}`,
        (err, res) => {
            if (err) {
                console.error(err)
                result(null, err);
                return;
            }
            result(null, res);
        });
};

Log.createBehav = ({ projectId, type, status, timestamp }, result) => {
    sql.query("INSERT INTO behavior_log SET ?", { projectId, type, status, timestamp }, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, { projectId, type, status, timestamp });
    });
}


Log.createAnchor = ({ projectId, clientX, clientY, innerHTML, anchor, timestamp }, result) => {
    sql.query("INSERT INTO anchor_log SET ?", { projectId, clientX, clientY, innerHTML, anchor, timestamp }, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, { projectId, clientX, clientY, innerHTML, anchor, timestamp });
    });
}

module.exports = Log;
