import * as db from '../tools/db';
import { Application, Request, Response } from 'express';

export const register = (app: Application) => {
    /* /usergroup endpoint */
    
    // Get method
    app.get('/api/v1/usergroup', (req: Request, res: Response) => {
        db.connection.query('SELECT * FROM UserGroup', (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }   
            else {
                return res.send(results);
            }
        });
    });

    // Post method
    app.post('/api/v1/usergroup', (req: Request, res: Response) => {
        let title = req.query.title;
        let descrip = req.query.descrip;
        // it is not required to have a max capacity, because
        // by default is NULL
        let max_capacity = req.query.max_capacity; 

        if (!title || !descrip || !max_capacity) {
            return res.sendStatus(400);
        }
        else {
            let sql = `INSERT INTO UserGroup (title, max_capacity, descrip) 
                VALUES('${title}', '${max_capacity}', '${descrip}')`; 
            db.connection.query(sql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    /* /usergroup/:ugid */

    // Get method (Get specific UserGroup)
    app.get('/api/v1/usergroup/:ugid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let sql = `SELECT * FROM UserGroup WHERE usergroup_id = '${ugid}'`; 
            db.connection.query(sql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.send(results);
                }
            });
        }
    });

    // PUT Method (Update Existing UserGroup)
    app.put('/api/v1/usergroup/:ugid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let title = req.query.title;
        let max_capacity = req.query.max_capacity;
        let descrip = req.query.descrip;

        if (!ugid || !title || !descrip || !max_capacity) {
            return res.sendStatus(400);
        }
        else {
            let sql = `UPDATE UserGroup 
                SET title = '${title}', max_capacity = '${max_capacity}',descrip = '${descrip}'
                WHERE usergroup_id = '${ugid}' `;
            
            db.connection.query(sql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });
    
    // Delete Method (Remove user group)
    app.delete('/api/v1/usergroup/:ugid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let sql = `DELETE FROM UserGroup WHERE usergroup_id = '${ugid}'`;
            db.connection.query(sql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    /* /usergroup/:ugid/members */

    // Get method (get all members of usergroup)
    app.get('/api/v1/usergroup/:ugid/members', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `SELECT * FROM UserGroupMembership 
                WHERE usergroup_id = '${ugid}'`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.send(results);
                }
            });
        }
    });

    // Post method (add new member to the usergroup)
    app.post('/api/v1/usergroup/:ugid/members', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let user_id = req.query.user_id;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `INSERT INTO UserGroupMembership VALUES('${user_id}', '${ugid}')`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    // Delete Method (remove member from an usergroup)
    app.delete('/api/v1/usergroup/:ugid/members/:uid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let user_id = req.params.uid;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `DELETE FROM UserGroupMembership 
                WHERE user_id = '${user_id}' AND usergroup_id = '${ugid}'`;

            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                } 
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    /* /usergroup/:ugid/owners */
    
    // Get method (get all owners of an usergroup)
    app.get('/api/v1/usergroup/:ugid/owners', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `SELECT * FROM UserGroupOwner 
                WHERE usergroup_id = '${ugid}'`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.send(results);
                }
            });
        }
    });

    // Post method (add new owner to the usergroup)
    app.post('/api/v1/usergroup/:ugid/owners', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let user_id = req.query.user_id;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `INSERT INTO UserGroupOwner VALUES('${user_id}', '${ugid}')`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    // Delete Method (remove owner from an usergroup)
    app.delete('/api/v1/usergroup/:ugid/owners/:uid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let user_id = req.params.uid;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `DELETE FROM UserGroupOwner 
                WHERE user_id = '${user_id}' AND usergroup_id = '${ugid}'`;

            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                } 
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    /* /usergroup/:ugid/invited */

    // Get method (get all invited users of an usergroup)
    app.get('/api/v1/usergroup/:ugid/invited', (req: Request, res: Response) => {
        let ugid = req.params.ugid;

        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `SELECT * FROM UserGroupInvite 
                WHERE usergroup_id = '${ugid}'`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.send(results);
                }
            });
        }
    });

    // Post method (invite new user to an usergroup)
    app.post('/api/v1/usergroup/:ugid/invited', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let invite_id = req.query.invite_id;

        if (!ugid || !invite_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `INSERT INTO UserGroupInvite VALUES('${invite_id}', '${ugid}')`;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    // Delete Method (remove invitation of user to usergroup)
    app.delete('/api/v1/usergroup/:ugid/invited/:uid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let invite_id = req.params.uid;

        if (!ugid || !invite_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `DELETE FROM UserGroupInvite 
                WHERE invite_id = '${invite_id}' AND usergroup_id = '${ugid}'`;

            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                } 
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    /* /usergroup/:ugid/requested */

    // Get method (get all requested users of usergroup)
    app.get('/api/v1/usergroup/:ugid/requested', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `SELECT * FROM GroupRequest 
                WHERE usergroup_id = '${ugid}' `;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.send(results);
                }
            });
        }
    });

    // Post method (add a new request to join an usergroup)
    app.post('/api/v1/usergroup/:ugid/requested', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let request_id = req.query.request_id;

        if (!ugid || !request_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `INSERT INTO GroupRequest
                VALUES('${request_id}', '${ugid}')`;
            
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });

    // Delete method (remove request to join an usergroup)
    app.delete('/api/v1/usergroup/:ugid/requested/:uid', (req: Request, res: Response) => {
        let ugid = req.params.ugid;
        let request_id = req.params.uid;

        if (!ugid || !request_id) {
            return res.sendStatus(400);
        }
        else {
            let mysql = `DELETE FROM GroupRequest
                WHERE request_id = '${request_id}' AND usergroup_id = '${ugid}' `;
            db.connection.query(mysql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                else {
                    return res.sendStatus(200);
                }
            });
        }
    });
};