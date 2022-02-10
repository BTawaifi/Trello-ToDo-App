"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
if (cluster_1.default.isPrimary) {
    console.log(`Process ${process.pid} running`);
    const numCpus = os_1.default.cpus().length;
    console.log(`Forking ${numCpus} process`);
    for (let index = 0; index < numCpus; index++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, error) => {
        if (error == 300) {
            console.error(`Fatal Error`);
            process.exit(1);
        }
        else {
            console.error(`worker ${worker.id} killed reforking`);
            cluster_1.default.fork();
        }
    });
}
else {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: '*'
    }));
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use(express_1.default.json());
    app.use('/', routes_1.default);
    app.listen(PORT, () => {
        console.log(`${process.pid} listening on port ${PORT}`);
    });
    process.on('uncaughtException', (err) => {
        console.log(err);
        if (err.code == 'EADDRINUSE') {
            process.exit(300);
        }
        process.exit(1);
    });
}
