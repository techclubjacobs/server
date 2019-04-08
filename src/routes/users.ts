import * as db from '../tools/db';
import { Application, Response, Request, NextFunction } from "express";
// import * as queryParser from "query-parser"

export const register = (app: Application) => {
    // use JSON from parser middleware
    /*app.use(queryParser.json());
    // use Query String Parser middleware
    app.use(queryParser.urlencoded({
        extended: false
    }));  */
    
    /* /users endpoint */

    // Get method (get list of all users)
    app.get('/api/v1/users', (req: Request, res: Response) => {
        db.connection.query('SELECT * FROM User', (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            } 
            return res.send(results);
        });
    });

    // Post method (create a new user)
    app.post('/api/v1/users', (req: Request, res: Response) => {
        // Need: firstname, lastname, email
        let firstname = req.query.first_name;
        let lastname = req.query.last_name;
        let email = req.query.email;
        
        if (!firstname || !lastname || !email) {
            return res.sendStatus(400);
        }

        let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sql = `INSERT INTO User (first_name, last_name, email, activated, joined) 
            VALUES (?, ?, ?, ?, ?);`
    
        let data = [firstname, lastname, email, 1, now];    
        db.connection.query(sql, data, (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
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
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    // Put method (update user profile)
    app.put('/api/v1/users/:uid', (req: Request, res: Response, next: NextFunction) => {
        // middleware
        // restrict PUT (only admin or own user), don't allow DELETE
        if (req.query.key != '5736ac861c2e50e0a2223dab84502a7e08bd904d'){
            return res.sendStatus(401).send('You shall not pass');
        }

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
    app.get('/api/v1/users/:uid/usergroups', (req: Request, res: Response) => {
        let uid = req.params.uid;
        // filter by parameters
        let filter_by = req.query.filter_by;
        if (!uid) {
            return res.sendStatus(400);
        }

        if (filter_by === 'member' || !filter_by) {
            let sql = `SELECT * FROM UserGroup 
                INNER JOIN UserGroupMembership ON 
                UserGroupMembership.usergroup_id = UserGroup.usergroup_id
                WHERE UserGroupMembership.user_id = ?`;
            
            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }

                // include links to each usergroup
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + results[i]["usergroup_id"];
                }
                return res.send(results);
            });
        }
        else if (filter_by === 'owner') {
            let sql = `SELECT * FROM UserGroup 
                INNER JOIN UserGroupOwner ON 
                UserGroupOwner.usergroup_id = UserGroup.usergroup_id
                WHERE UserGroupOwner.user_id = ?`;

            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }

                // include links to each usergroup
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + results[i]["usergroup_id"];
                }
                return res.send(results);
            });
        }
        else if (filter_by === 'invited') {
            let sql = `SELECT * FROM UserGroup 
                INNER JOIN UserGroupInvite ON 
                UserGroupInvite.usergroup_id = UserGroup.usergroup_id
                INNER JOIN Invite ON
                Invite.invite_id = UserGroupInvite.invite_id
                WHERE Invite.user_id = ?`;
            
            db.connection.query(sql, [uid],(error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }

                // include links to each usergroup
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + results[i]["usergroup_id"];
                }
                return res.send(results);
            });
        }
        else if (filter_by === 'requested') {
            let sql = `SELECT * FROM UserGroup 
                INNER JOIN GroupRequest ON 
                GroupRequest.usergroup_id = UserGroup.usergroup_id
                INNER JOIN Request ON
                Request.request_id = GroupRequest.request_id
                WHERE Request.user_id = ?`;
            
            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }

                // include links to each usergroup
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + results[i]["usergroup_id"];
                }
                return res.send(results);
            });
        }
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
            WHERE UserGroupMembership.user_id = ? AND UserGroupMembership.usergroup_id = ?`;
        
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
        let status = req.query.status;
        if (!uid || !ugid || !status) {
            return res.sendStatus(400);
        }

        if (status === 'requested') {
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
        else if (status === 'invited') {
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
        else if (status === 'member') {
            let sql = `INSERT INTO UserGroupMembership VALUES(?, ?)`;
            
            db.connection.query(sql, [uid, ugid], (error, results, fields) => {
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
    app.delete('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response, next: NextFunction) => {
        if (req.query.key != '5736ac861c2e50e0a2223dab84502a7e08bd904d'){
            return res.sendStatus(401).send('You shall not pass');
        }
        
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

        let sql = `(SELECT title, public, max_capacity, content, usergroup_id,
            location_id, evcat_id FROM Event 
            INNER JOIN EventInvite ON 
                EventInvite.event_id = Event.event_id
            INNER JOIN Invite ON
                Invite.invite_id = EventInvite.invite_id  
            WHERE Invite.user_id = ?)
            UNION ALL
            (SELECT title, public, max_capacity, content, usergroup_id,
                location_id, evcat_id FROM Event 
            INNER JOIN EventRequest ON 
                EventRequest.event_id = Event.event_id
            INNER JOIN Request ON
                Request.request_id = EventRequest.request_id  
            WHERE Request.user_id = ?)`;
        
        db.connection.query(sql, [uid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    /* /users/:uid/events/:eid endpoint */

    // Get method (get specific event (can be single or recurring single))
    app.get('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let eid = req.params.eid;
        if (!uid || !eid) {
            return res.sendStatus(400);
        }

        // first find it in OneTimeEvent
        /*let sql = `(SELECT title, public, max_capacity, content, usergroup_id,
            location_id, evcat_id FROM Event
            WHERE Event.event_id = ?)
            UNION ALL
            (SELECT day, start_time, end_time, null, null, null, null FROM OneTimeEvent
            WHERE OneTimeEvent.event_id = ?)
            UNION ALL
            (SELECT day, start_time, end_time, RecurringEvent.occurences, null, null, null 
                FROM RecurringSingleEvent
            INNER JOIN RecurringEvent ON
            RecurringEvent.recurringevent_id = RecurringSingleEvent.recurringevent_id
            WHERE RecurringEvent.event_id = ?)`;*/

        let sql = 
            `
                SELECT title, public, max_capacity, content, usergroup_id,
                    location_id, evcat_id FROM Event 
                    WHERE event_id = ?;
                SELECT day, start_time, end_time FROM OneTimeEvent
                    WHERE event_id = ?;
                SELECT day, start_time, end_time, RecurringEvent.occurences 
                    FROM RecurringSingleEvent
                    INNER JOIN RecurringEvent ON
                    RecurringEvent.recurringevent_id = RecurringSingleEvent.recurringevent_id
                    WHERE RecurringEvent.event_id = ?;
            `;

        db.connection.query(sql, [eid, eid, eid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    // PUT Method (update user's status at event (Nothing Accepted Rejected Interested))
    app.put('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let eid = req.params.eid;
        let status = req.query.status;
        
        if (!uid || !eid || !status) {
            return res.sendStatus(400);
        }

        let sql = `UPDATE Invite SET decision = ? WHERE event_id`;
    });

    // Delete method (remove event from user's events (delete event for user, for everyone if organizer))
    app.delete('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        let uid = req.params.uid;
        let eid = req.params.eid;
        
        if (!uid || !eid) {
            return res.sendStatus(400);
        }


    });

    /*  /users/<uid>/products endpoint  */

    // Get method (get all products by the user (as seller))
    app.get('/api/v1/users/:uid/products', (req: Request, res: Response) => {
        let uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM Product WHERE seller_id = ?`;
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });

    /* /users/<uid>/chats endpoint  */
    app.get('/api/v1/users/:uid/chats', (req: Request, res: Response) => {
        let uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        let sql = `SELECT * FROM Chat WHERE buyer_id = ? OR seller_id = ?`;
        db.connection.query(sql, [uid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send(results);
        });
    });
};