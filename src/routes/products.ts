import {Application, Request, Response} from "express";
import * as db from "../tools/db";

export const register = (app: Application) => {

    app.get("/api/v1/products", (request: Request, response: Response) => {
        db.connection.query(`SELECT * FROM Product;`, (err, res) => {
            if (err) {
                return response.sendStatus(500);
            } else {
                return response.send({
                    products : res,
                });
            }

        });
    });

    app.post("/api/v1/products", (request: Request, response: Response) => {
        // Need: Title, price
        if (!request.query.title || !request.query.price || !request.params.evcat_id || !request.params.user_id) {
            return response.sendStatus(400);
        } else {
            const now = new Date().toISOString().slice(0, 19).replace("T", " ");
            db.connection.query(`INSERT INTO Product
            (evcat_id, seller_id, title, price, published, active, sold, quantity) values ('?', '?', '?', 1, 0, ?);`,
            [request.params.evcat_id, request.params.user_id, request.query.title,
                request.query.price, now, request.query.quantity],
            (err, res) => {
                if (err) {
                    return response.sendStatus(500);
                } else {
                    return response.sendStatus(201);
                }
            });
        }
    });

    app.get("/api/v1/products/:product_id", (request: Request, response: Response) => {
        db.connection.query(`SELECT * FROM Product WHERE product_id = ?`, [request.params.product_id], (err, res) => {
            if (err) {
                return response.sendStatus(500);
            } else {
                return response.send({
                    product : res,
                });
            }
        });
    });

    app.put("/api/v1/products/:product_id", (request: Request, response: Response) => {
        db.connection.query(`UPDATE Product SET ? WHERE product_id = ?`,
        [request.body, request.params.product_id], (err, res) => {
            if (err) {
                return response.sendStatus(500);
            } else {
                return response.sendStatus(200);
            }
        });
    });

    app.delete("/api/v1/products/:product_id", (request: Request, response: Response) => {
        db.connection.query(`DELETE FROM Product WHERE product_id = ?`, [request.params.product_id], (err, res) => {
            if (err) {
                return response.sendStatus(500);
            } else {
                return response.sendStatus(200);
            }
        });
    });

    app.get("/api/v1/products/:product_id/chats", (request: Request, response: Response) => {
        db.connection.query(`SELECT * FROM Chat WHERE product_id = ?`, [request.params.product_id], (err, res) => {
            if (err) {
                return response.sendStatus(500);
            } else {
                return response.send({
                    chat : res,
                });
            }
        });
    });

    app.post("/api/v1/products/:product_id/chats", (request: Request, response: Response) => {
        // Need: product_id, buyer_id, seller_id
        if (!request.params.product_id || !request.params.user_id || !request.params.seller_id) {
            return response.sendStatus(400);
        } else {
            db.connection.query(`INSERT INTO Chat (product_id, buyer_id, seller_id) values
            ('?','?','?')` , [request.params.product_id, request.params.user_id, request.params.seller_id],
             (err, res) => {
                if (err) {
                    return response.sendStatus(500);
                } else {
                    return response.sendStatus(201);
                }
            });
        }
    });
};
