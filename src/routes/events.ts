import * as db from '../tools/db';
import { Application, Request, Response } from "express";

export const register = (app: Application) => {
    /* /events endpoint */

    // Get method (get all events (filter by category, location, time))
    app.get('/api/v1/events', (req: Request, res: Response) => {
        const filter_by = req.body.filter_by;
        const value_filter = req.body.value_filter; // for category and location
        // for time
        const start_time = req.body.start_time;
        const end_time = req.body.end_time;

        if (filter_by === 'category') {
            const sql = `
                SELECT * FROM Event
                INNER JOIN EventCategory ON
                EventCategory.evcat_id = Event.evcat_id
                WHERE EventCategory.title = ?`; 
            
            db.connection.query(sql, [value_filter], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                return res.send({
                    "events": results
                });
            });
        }
        else if (filter_by === 'location') {
            const sql = `
                SELECT * FROM Event
                INNER JOIN Location ON
                Location.location_id = Event.location_id
                WHERE Location.title = ?`;

            db.connection.query(sql, [value_filter], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                return res.send({
                    "events": results
                });
            });
        }
        else if (filter_by === 'time') {
            const sql = `
                SELECT * FROM Event
                INNER JOIN OneTimeEvent ON
                OneTimeEvent.event_id = Event.event_id
                WHERE OneTimeEvent.start_time >= ? AND OneTimeEvent.end_time <= ?;
                
                SELECT * FROM Event
                INNER JOIN RecurringEvent ON
                RecurringEvent.event_id = Event.event_id
                INNER JOIN RecurringSingleEvent ON
                RecurringSingleEvent.recurringevent_id = RecurringEvent.recurringevent_id
                WHERE RecurringSingleEvent.start_time >= ? AND RecurringSingleEvent.end_time <= ?;`;

            db.connection.query(sql, [start_time, end_time, start_time, end_time], 
                (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }

                return res.send({
                    "events": results[0].concat(results[1])
                });
            });
        }
        else {
            const sql = `SELECT * FROM Event`;
            
            db.connection.query(sql, (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                return res.send({
                    "events": results
                });
            });
        }
    });

    // Post method (create new event)
    app.post('/api/v1/events', (req: Request, res: Response) => {
        const title = req.body.title;
        const max_capacity = req.body.max_capacity;
        const content = req.body.content;
        const ugid = req.body.ugid;
        const lid = req.body.lid;
        const evcat_id = req.body.evcat_id;

        if (!title || !ugid || !lid || !evcat_id) {
            return res.sendStatus(400);
        }

        const sql = `INSERT INTO Event (title, public, max_capacity, content,
            usergroup_id, location_id, evcat_id) VALUES(?, ?, ?, ?, ?, ?, ?)`;
        db.connection.query(sql, [title, 1, max_capacity, content, ugid, lid, evcat_id],
            (error, results, fields) => {

                if (error) {
                    return res.sendStatus(500);
                }
                return res.sendStatus(201);
        });
    });

    /* /events/:evid */

    // Get method (can be single, recurring single or recurring (?) event)
    // get specific event
    app.get('/api/v1/events/:evid', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `
            SELECT * FROM OneTimeEvent
            WHERE event_id = ?;
            
            SELECT * FROM RecurringEvent
            INNER JOIN RecurringSingleEvent ON
            RecurringSingleEvent.recurringevent_id = RecurringEvent.recurringevent_id
            WHERE RecurringEvent.event_id = ?`;

        db.connection.query(sql, [evid, evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }

            return res.send({
                "OneTimeEvent": results[0],
                "RecurringEvent": results[1]
            });
        });
    });

    // Put method (update existing event)
    app.put('/api/v1/events/:evid', (req: Request, res: Response) => {
        const evid = req.params.evid;
        const title = req.body.title;
        const max_capacity = req.body.max_capacity;
        const content = req.body.content;
        const ugid = req.body.ugid;
        const lid = req.body.lid;
        const evcat_id = req.body.evcat_id;
        if (!evid || !title || !max_capacity || !content 
            || !ugid || !lid || !evcat_id) {
            return res.sendStatus(400);
        }
        
        const sql = `
            UPDATE Event
            SET title = ?, max_capacity = ?, content = ?,
            usergroup_id = ?, usergroup_id = ?, evcat_id = ?
            WHERE event_id = ?`;
        
        db.connection.query(sql, [title, max_capacity, content,
            ugid, lid, evcat_id, evid], (error, results, fields) => {

            if (error) {
                return res.sendStatus(500);
            }

            return res.sendStatus(200);
        });
    });

    // Delete Method (remove existing event)
    app.delete('/api/v1/events/:evid', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `DELETE FROM Event
            WHERE event_id = ?`;
        
        db.connection.query(sql, [evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /events/:evid/invited */
    
    // Get method (get users that are invited to the event)
    app.get('/api/v1/events/:evid/invited', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM User   
            INNER JOIN Invite ON
            Invite.user_id = User.user_id
            INNER JOIN EventInvite ON
            EventInvite.invite_id = Invite.invite_id
            WHERE EventInvite.event_id = ?`;

        db.connection.query(sql, [evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "invited": results
            });
        });
    });

    // Post method (invite user to event)
    app.post('/api/v1/events/:evid/invited', (req: Request, res: Response) => {
        const evid = req.params.evid;
        const uid = req.body.uid;
        const message = req.body.message || "You have been invited to an event";
        if (!evid || !uid) {
            return res.sendStatus(400);
        }

        // create new Invite
        const sql = `
            INSERT INTO Invite (user_id, message)
            VALUES(?, ?);
            
            INSERT INTO EventInvite(invite_id, event_id)
            SELECT Invite.invite_id, ? FROM Invite
            WHERE Invite.user_id = ?; `;

        db.connection.query(sql, [uid, message, evid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    /* /events/:evid/confirmed */

    // Get method (get users that are attending event)
    app.get('/api/v1/events/:evid/confirmed', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `
            (SELECT * FROM User
            INNER JOIN SingularAttendance ON
            SingularAttendance.user_id = User.user_id
            WHERE SingularAttendance.event_id = ?)
            UNION ALL
            (SELECT * FROM User
            INNER JOIN RecurringAttendance ON
            RecurringAttendance.user_id = User.user_id
            WHERE RecurringAttendance.event_id = ?)`;
        
        db.connection.query(sql, [evid, evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                users: results
            });
        });
    });

    /* /events/:evid/requested */

    // Get method (get users that requested to join event)
    app.get('/api/v1/events/:evid/requested', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM User   
            INNER JOIN Request ON
            Request.user_id = User.user_id
            INNER JOIN EventRequest ON
            EventRequest.request_id = Request.request_id
            WHERE EventRequest.event_id = ?`;

        db.connection.query(sql, [evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "requested": results
            });
        });
    });

    // Post method (request to join event)
    app.post('/api/v1/events/:evid/requested', (req: Request, res: Response) => {
        const evid = req.params.evid;
        const uid = req.body.uid;
        const message = req.body.message || "You have requested to join the event";
        if (!evid || !uid) {
            return res.sendStatus(400);
        }

        // create new Request
        const sql = `
            INSERT INTO Request (user_id, message)
            VALUES(?, ?);
            
            INSERT INTO EventRequest(request_id, event_id)
            SELECT Request.request_id, ? FROM Request
            WHERE Request.user_id = ?; `;

        db.connection.query(sql, [uid, message, evid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    /* /events/:evid/organizing */

    // Get method (get event organizers)
    app.get('/api/v1/events/:evid/organizing', (req: Request, res: Response) => {
        const evid = req.params.evid;
        if (!evid) {
            return res.sendStatus(400);
        }

        const sql = `
            SELECT * FROM User
            INNER JOIN Organizer ON
            Organizer.user_id = User.user_id
            WHERE Organizer.event_id = ?`;
        
        db.connection.query(sql, [evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "organizers": results 
            });
        });
    });

    // Post method (add event organizer)
    app.post('/api/v1/events/:evid/organizing', (req: Request, res: Response) => {
        const evid = req.params.evid;
        const uid = req.body.uid;
        if (!evid || !uid) {
            return res.sendStatus(400);
        }

        const sql = `INSERT INTO Organizer (user_id, event_id)
                VALUES(?, ?)`;
        db.connection.query(sql, [uid, evid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });
};