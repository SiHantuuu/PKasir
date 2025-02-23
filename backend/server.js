// server.js
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const db = require('./config/db');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost'
    });

    server.route(routes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();
