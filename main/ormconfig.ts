import { ConnectionOptions } from "typeorm";

const connectionOptions: ConnectionOptions =
{
    "type": "mongodb",
    "host": "localhost",
    "port": 3306,
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

export default connectionOptions;