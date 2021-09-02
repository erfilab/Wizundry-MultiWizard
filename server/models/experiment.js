const sql = require("./db.js");

// constructor
const Experiment = function () {
};

Experiment.create = (param, result) => {
    sql.query("INSERT INTO experiment SET ?", { ...param }, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, { ...res.id, ...param });
    });
}

Experiment.getAll = result => {
    sql.query("SELECT * FROM experiment", (err, res) => {
        if (err) {
            console.error(err)
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Experiment.deleteById = (id, result) => {
    sql.query("DELETE FROM experiment WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error(err)
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Experiment.getById = (id, result) => {
    sql.query("SELECT * FROM experiment WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error(err)
            result(null, err);
            return;
        }
        result(null, res);
    });
};


module.exports = Experiment;
