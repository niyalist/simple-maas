var options = {
    // initialization options;
};

var pgp = require("pg-promise")(options);
var db = pgp("postgres://"+ process.env.RDS_USERNAME +":" + process.env.RDS_PASSWORD+ "@" + process.env.RDS_HOSTNAME + ":" + process.env.RDS_PORT + "/gtfs-saga");
 
module.exports = db;