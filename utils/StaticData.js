
let DBConnectionPool = require('../sql').DBConnectionPool;

if(!module.exports.DBConnectionPool) {
    module.exports.DBConnectionPool = new DBConnectionPool();
}
