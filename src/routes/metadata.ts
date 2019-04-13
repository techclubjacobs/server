import { Application, Request, Response } from 'express';
import * as db from '../tools/db';

// for location, categories, etc

export const register = (app: Application) => {

    // GET ProductCategories
    app.get('/api/v1/prodcats', (req: Request, res: Response) => {
        db.connection.query('SELECT * from ProductCategory;', (error, results) => {
            if (error) {
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });

    // GET EventCategories
    app.get('/api/v1/evcats', (req: Request, res: Response) => {
        db.connection.query('SELECT * from EventCategory;', (error, results) => {
            if (error) {
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });

    // GET Locations
    app.get('/api/v1/locations', (req: Request, res: Response) => {
        db.connection.query('SELECT * from Location;', (error, results) => {
            if (error) {
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });
};
