const sql = require("./db.js");

// constructor
const User = function(user) {
    this.uid = user.uid;
    this.password = user.password;
    this.email = user.email;
    this.username = user.username;
    this.role = user.role;
    this.createdAt = user.createdAt;
};

User.addLoginLog = ({uid, email, username, role, createdAt}, result) => {
    sql.query("INSERT INTO login_log SET ?", {uid, email, username, role, createdAt}, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, {email, name, role, createdAt});
    });
}


User.create = (params, result) => {
    sql.query("INSERT INTO user_info SET ?", ({ ...params }), (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
}



User.getAll = result => {
    sql.query("SELECT * FROM user_info as ui LEFT JOIN project_info as pi on ui.username = pi.participant", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

User.findById = (uid, result) => {
    sql.query(`SELECT * FROM user_info WHERE uid = '${uid}'`, (err, res) => {
        if (err) {
            console.error(err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("Found User: ", res[0]);
            result(null, res[0]);
        }
    });
};

User.getByUsername = (username, result) => {
    sql.query(`SELECT * FROM user_info WHERE username = '${username}'`, (err, res) => {
        if (err) {
            console.error(err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = User;
