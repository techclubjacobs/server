import * as db from '../tools/db';
import { Application, Response, Request } from "express";

export const register = (app: Application) => {
    /* /users endpoint */

    // Get method (get list of all users)
    app.get('/api/v1/users', (req: Request, res: Response) => {
        db.connection.query('SELECT * FROM User', (err, results, fields) => {
            if (err) {
                res.sendStatus(500);
            } 
            res.send(results);
        });
    });

    // Post method (create a new user)
    app.post('/api/v1/users', (req: Request, res: Response) => {
        // Need: firstname, lastname, email
        if (!req.query.firstname || !req.query.lastname || !req.query.email) {
            res.sendStatus(400);
        }

        let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let query = req.query;
        let sql = `INSERT INTO User (first_name, last_name, email, activated, joined) values 
            ('${query.firstname}', '${query.lastname}', '${query.email}', 1, '${now}');`
        
        db.connection.query(sql, (err, results, fields) => {
            if (err) {
                res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });

    /* /users/:uid endpoint */

    // Get method (get specific user)
    app.get('/api/v1/users/:uid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM User WHERE user_id = ?`;

        db.connection.query(sql, [uid], (err, results, fields) => {
            if (err) {
                res.sendStatus(500);
            }
            res.send(results);
        });
    });

    // Put method (update user profile)
    app.put('/api/v1/users/:uid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        // at least one parameter is required, at most 3
        let first_name = req.query.first_name;
        let last_name = req.query.last_name;
        let email = req.query.email;

        if (!uid || (!first_name && !last_name && !email)) {
            return res.sendStatus(400);
        }

        // no matter how many parameters are passed in the range [1..3]
        // we are ready to handle them :)
        let sql = `UPDATE User SET `;
        let data = [];

        let counter = 0
        if (first_name) {
            sql += `first_name = ? `;
            data.push(first_name);
            counter++;
        }
        if (last_name) {
            if (counter != 0) {
                sql += `, `;
            }
            sql += `last_name = ? `;
            data.push(last_name);
            counter++;
        }
        if (email) {
            if (counter != 0) {
                sql += `, `;
            }
            sql += `email = ?`;
            data.push(email);
            counter++;
        }
        sql += ` WHERE user_id = ?`;
        data.push(uid);

        db.connection.query(sql, data, (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /users/:uid/usergroups endpoint */

    // Get method (get all of user's usergroups (filter by member, owner, invited, requested))
    // and also include links to each usergroup
    app.get('/api/v1/users/:uid/usergroups', (req: Request, res: Response) => {
        let uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM UserGroup 
            INNER JOIN UserGroupMembership ON 
            UserGroupMembership.usergroup_id = UserGroup.usergroup_id
            WHERE UserGroupMembership.user_id = ?`;
        
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    /* /users/:uid/usergroups/:ugid */
    
    // Get method (get user's specific usergroup)
    app.get('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let ugid = req.params.ugid;
        if (!uid || !ugid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM UserGroup 
            INNER JOIN UserGroupMembership ON 
            UserGroupMembership.usergroup_id = UserGroup.usergroup_id
            WHERE UserGroupMembership.user_id = ? AND UserGroupMembership.usergroup_id`;
        
        db.connection.query(sql, [uid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    // Put method (update user's status for usergroup (Nothing, Accepted, Rejected, Interested))
    app.put('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let ugid = req.params.ugid;
        let action = req.query.action;
        let status = req.query.status;
        if (!uid || !ugid || !status || !action) {
            return res.sendStatus(400);
        }

        if (action === 'Request') {
            let sql = `UPDATE Request 
                INNER JOIN GroupRequest ON 
                GroupRequest.request_id = Request.request_id
                SET Request.decision = ? 
                WHERE Request.user_id = ? AND GroupRequest.usergroup_id = ?`;
            
            db.connection.query(sql, [status, uid, ugid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                return res.sendStatus(200);
            });
        }
        else if (action === 'Invite') {
            let sql = `UPDATE Invite 
                INNER JOIN UserGroupInvite ON 
                UserGroupInvite.invite_id = Invite.invite_id
                SET Invite.decision = ? 
                WHERE Invite.user_id = ? AND UserGroupInvite.usergroup_id = ?`;
            
            db.connection.query(sql, [status, uid, ugid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                return res.sendStatus(200);
            });
        }
        else {
            return res.sendStatus(400);
        }
    });

    // Delete method (delete user's usergroup)
    app.delete('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let ugid = req.params.ugid;
        if (!uid || !ugid) {
            return res.sendStatus(400);
        }

        let sql = `DELETE FROM UserGroupMembership 
        WHERE user_id = ? AND usergroup_id = ?`;

        db.connection.query(sql, [uid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /users/:uid/events endpoint */

    // Get method (get all of the user's events (filter by confirmed, requested, invited, organizing))
    app.get('/api/v1/users/:uid/events', (req: Request, res: Response) => {
        let uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        let data = {};
        let sql = `SELECT * FROM Event 
            INNER JOIN EventInvite ON 
                EventInvite.event_id = Event.event_id
            INNER JOIN Invite ON
                Invite.invite_id = EventInvite.invite_id  
            WHERE Invite.user_id = ?`;
        
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            data = results;
        });
        
        sql = `SELECT * FROM Request 
            INNER JOIN EventRequest ON 
                EventRequest.event_id = Event.event_id
            INNER JOIN Request ON
                Request.request_id = EventRequest.request_id;  
            WHERE Request.user_id = ?`;
        
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            data += results;
            return res.send(data);
        });
    });

    /* /users/:uid/events/:eid endpoint */

    /*// Get method (get specific event (can be single or recurring single))
    app.get('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let eid = req.params.eid;
        if (!uid || !eid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM Event 
        INNER JOIN EventInvite ON 
            EventInvite.event_id = Event.event_id
        INNER JOIN Invite ON
            Invite.invite_id = EventInvite.invite_id  
        WHERE Invite.user_id = ?`;
    
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });*/

    // To be contiuned
};