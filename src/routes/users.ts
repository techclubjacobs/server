import * as db from '../tools/db';
import { Application, Response, Request } from "express";

export const register = (app: Application) => {

    app.get('/api/v1/users', (req: Request, res: Response) => {
        db.connection.query('select * from User;', (err, rows) => {
            if (err) {
                res.sendStatus(500);
            } else {
                res.send(rows);
            }
        });
    });

    app.post('/api/v1/users', (req: Request, res: Response) => {
        // Need: firstname, lastname, email
        if (!req.query.firstname || !req.query.lastname || !req.query.email) {
            res.sendStatus(400);
        }
        else {
            var now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            var query = req.query
            var sql = `insert into User (first_name, last_name, email, activated, joined) values 
                ('${query.firstname}', '${query.lastname}', '${query.email}', 1, '${now}');`
            
            db.connection.query(sql, (err, rows) => {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });

    app.get('/api/v1/users/:userid', (req: Request, res: Response) => {
        db.connection.query(`select * from User where User.user_id = ${req.params.userid};`, (err, rows) => {
            if (err) {
                res.sendStatus(500);
            } else {
                res.send(rows);
            }
        });
    });

};