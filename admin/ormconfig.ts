import { ConnectionOptions } from "typeorm";

const connectionOptions: ConnectionOptions =
{
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

export default connectionOptions;