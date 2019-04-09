import * as express from "express";
import * as db from '../tools/db';

// for location, categories, etc

export const register = (app: express.Application) => {

    //GET ProductCategories
    app.get('/api/v1/prodcast',(req: Request, res: Response) => {
        db.connection.query('SELECT * from ProductCategory;', (error, results) => {
            if (error){
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });

    //GET EventCategories
    app.get('/api/v1/evcats',(req, res) => {
        db.connection.query('SELECT * from EventCategory;',(error,results)=>{
            if (error){
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });

    //GET Locations
    app.get('/api/v1/locations',(req,res) =>{
        db.connection.query('SELECT * from Location;' ,(error,results)=>{
            if (error){
                return res.sendStatus(200);
            }
            return res.send(results);
        });
    });
};
