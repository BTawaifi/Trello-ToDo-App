import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import helmet from 'helmet';
import compression from "compression";
import Dotenv from "dotenv";
import router from "./router/routes";
Dotenv.config();

export default function server() {
    const PORT = process.env.PORT || 5000;

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

    //handle 404
    app.use((_req, res) => {
        res.status(404).send(`<div style="
        color: darkgrey;
        font-family: Helvetica;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
      ">
    <h1 style="/* text-align:center; */margin: 0;font-size: 5em;">404</h1>
    <h2 style="margin: 0.5em;">Not Found</h2>
    <h4 style="margin: 0.5em;">The resource requested couldn't be found on this server</h4>
    </div>`);
    });

    //Handles Routing Errors
    app.use((_error: any, _req: Request, res: Response, _next: NextFunction) => {
        console.warn({ message: _req });
        console.error({ message: _error });
        console.error({ message: 'route error' });
        res.status(500).send('Something broke!');
    });

    app.listen(PORT, () => {
        console.log(`${process.pid} listening on port ${PORT}`);
    });
}