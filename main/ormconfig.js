"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connectionOptions = {
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "database": "node_main",
    "entities": [
        "src/entity/*.js"
    ],
    "logging": false,
    "synchronize": true,
    "cli": {
        "entitiesDir": "src/entity"
    }
};
exports.default = connectionOptions;
