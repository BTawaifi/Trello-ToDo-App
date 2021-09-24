'use strict';

const express = require("express");
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors');
const routes = require('./routes');

const PORT = process.env.PORT || 5000;
require('dotenv').config()


//Multi Processor support for scaling
const os = require('os')
const cluster = require('cluster')


if (cluster.isMaster) {
    console.log(`Process ${process.pid} running`)
    const numCpus = os.cpus().length;
    console.log(`Forking ${numCpus} process`)
    for (let index = 0; index < numCpus; index++) {
        cluster.fork()
    }
    cluster.on('exit', (worker) => {
        console.error(`worker ${worker.pid} killed`)
        cluster.fork()
    })
}
else {

    //Modify CORS to allow or disallow Cross-origin resource sharing (whitelist the frontend)
    const app = express();
    app.use(cors({
        origin: '*' //Default allow requests from all origins
    }));

    //Security headers and compression
    app.use(helmet())
    app.use(compression())
    app.use(express.json())

    //Allows accessing routes from a different module
    app.use('/', routes);


    app.listen(PORT, () => {
        console.log(`${process.pid} listening on port ${PORT}`)
    });
}
