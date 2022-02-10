import express from 'express';
import cors from "cors";
import helmet from 'helmet';
import cluster, { Worker } from 'cluster';
import os from 'os';
import compression from "compression";
import Dotenv from "dotenv";
import router from "./routes";
Dotenv.config();

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
    console.log(`Process ${process.pid} running`);
    const numCpus = os.cpus().length;
    console.log(`Forking ${numCpus} process`);

    for (let index = 0; index < numCpus; index++) {
        cluster.fork();
    }

    cluster.on('exit', (worker: Worker, error) => {
        if (error == 300) { //prevent endless forking
            console.error(`Fatal Error`);
            process.exit(1);
        }
        else {
            console.error(`worker ${worker.id} killed reforking`);
            cluster.fork();
        }
    });
}
else {
    //Modify CORS to allow or disallow Cross-origin resource sharing (whitelist the frontend)
    const app = express();
    app.use(cors({
        origin: '*' //Default allow requests from all origins
    }));

    //Security headers and compression
    app.use(helmet());
    app.use(compression());
    app.use(express.json());

    //Allows accessing routes from a different module
    app.use('/', router);

    app.listen(PORT, () => {
        console.log(`${process.pid} listening on port ${PORT}`);
    });

    process.on('uncaughtException', (err: { errno: number, code: string, syscall: string, address: any, port: number }) => {
        console.log(err);
        if (err.code == 'EADDRINUSE') {
            process.exit(300);
        }
        process.exit(1);
    });
}
