import { Application, Request, Response } from "express";

export const register = (app: Application) => {

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello Jacobs.')
    });

};