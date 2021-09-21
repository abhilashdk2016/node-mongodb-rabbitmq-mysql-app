"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connectionOptions = {
    "type": "mysql",
    "host": "localhost",
    "username": "root",
    "password": "my-secret-pw",
    "port": 3306,
    "database": "node_admin",
    "entities": [
        "src/entity/*.js"
    ],
    "logging": false,
    "synchronize": true
};
exports.default = connectionOptions;
