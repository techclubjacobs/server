import * as db from '../tools/db';
import { Application, Response, Request } from "express";
//import { json } from 'body-parser';

export const register = (app: Application) => {
    //Global variable
    const states = ["accepted", "rejected", "interested"];

    function isEmpty(obj: any) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    /* /users endpoint */

    // Get method (get list of all users)
    app.get('/api/v1/users', (req: Request, res: Response) => {
        db.connection.query('SELECT * FROM User', (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "users": results
            });
        });
    });

    // Post method (create a new user)
    app.post('/api/v1/users', (req: Request, res: Response) => {
        // Need: firstname, lastname, email
        const firstname = req.body.first_name;
        const lastname = req.body.last_name;
        const email = req.body.email;
        
        if (!firstname || !lastname || !email) {
            return res.sendStatus(400);
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const sql = `INSERT INTO User (first_name, last_name, email, activated, joined) 
            VALUES (?, ?, ?, ?, ?);`
    
        const data = [firstname, lastname, email, 1, now];    
        db.connection.query(sql, data, (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    /* /users/:uid endpoint */

    // Get method (get specific user)
    app.get('/api/v1/users/:uid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM User WHERE user_id = ?`;
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "user": results[0]
            });
        });
    });

    // Put method (update user profile)
    app.put('/api/v1/users/:uid', (req: Request, res: Response) => {
        // middleware
        // restrict PUT (only admin or own user), don't allow delete
        if (req.body.key != '5736ac861c2e50e0a2223dab84502a7e08bd904d') {
            return res.sendStatus(401).send('You shall not pass');
        }

        const uid = req.params.uid;
        // at least one parameter is required, at most 3
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;

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
        const uid = req.params.uid;
        // filter by parameters
        const filter_by = req.body.filter_by;
        if (!uid) {
            return res.sendStatus(400);
        }

        if (filter_by === 'member') {
            const sql = `SELECT * FROM UserGroup
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
                return res.send({
                    "member": results
                });
            });
        }
        else if (filter_by === 'owner') {
            const sql = `SELECT * FROM UserGroup
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
                return res.send({
                    "owner": results
                });
            });
        }
        else if (filter_by === 'invited') {
            const sql = `SELECT * FROM UserGroup
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
                return res.send({
                    "invited": results
                });
            });
        }
        else if (filter_by === 'requested') {
            const sql = `SELECT * FROM UserGroup
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
                return res.send({
                    "requested": results
                });
            });
        }
        else {
            const sql = `
                SELECT * FROM UserGroup
                INNER JOIN UserGroupOwner ON
                UserGroupOwner.usergroup_id = UserGroup.usergroup_id
                WHERE UserGroupOwner.user_id = ?;

                SELECT * FROM UserGroup
                INNER JOIN UserGroupMembership ON
                UserGroupMembership.usergroup_id = UserGroup.usergroup_id
                WHERE UserGroupMembership.user_id = ?;

                SELECT * FROM UserGroup
                INNER JOIN UserGroupInvite ON
                UserGroupInvite.usergroup_id = UserGroup.usergroup_id
                INNER JOIN Invite ON
                Invite.invite_id = UserGroupInvite.invite_id
                WHERE Invite.user_id = ?;

                SELECT * FROM UserGroup
                INNER JOIN GroupRequest ON
                GroupRequest.usergroup_id = UserGroup.usergroup_id
                INNER JOIN Request ON
                Request.request_id = GroupRequest.request_id
                WHERE Request.user_id = ?;`;

            db.connection.query(sql, [uid, uid, uid, uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                // include links to each usergroup
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + results[i]["usergroup_id"];
                }
                return res.send({
                    "owner": results[0],
                    "member": results[1],
                    "invited": results[2],
                    "requested": results[3] 
                });
            });
        }
    });

    /* /users/:uid/usergroups/:ugid */
    
    // Get method (get user's specific usergroup)
    app.get('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        const ugid = req.params.ugid;
        if (!uid || !ugid) {
            return res.sendStatus(400);
        }
        
        const sql = `SELECT * FROM UserGroup 
            INNER JOIN UserGroupMembership ON 
            UserGroupMembership.usergroup_id = UserGroup.usergroup_id
            WHERE UserGroupMembership.user_id = ? AND UserGroupMembership.usergroup_id = ?`;
        
        db.connection.query(sql, [uid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            // provide a link for a usergroup
            results[0]["usergroup_link"] = "http://localhost:3000/api/v1/usergroup/"
                        + `${ugid}`;

            return res.send({
                "usergroup": results
            });
        });
    });

    // Put method (update user's status for usergroup (Invited, Requested, member))
    app.put('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        const ugid = req.params.ugid;
        const status = req.body.status;
        const value = req.body.value;
        if (!uid || !ugid || !status || !value) {
            return res.sendStatus(400);
        }

        if (status === 'requested') {
            switch(value) {
                case '1': {
                    // if admin accepted request 
                    const sql = `
                        INSERT INTO UserGroupMembership VALUES(?, ?);

                        UPDATE Request 
                        INNER JOIN GroupRequest ON 
                        GroupRequest.request_id = Request.request_id
                        SET Request.decision = ? 
                        WHERE Request.user_id = ? AND GroupRequest.usergroup_id = ?`;   
                        
                    db.connection.query(sql, [uid, ugid, states[value], uid, ugid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                case '2': {
                    // if admin declined request
                    const sql = `
                        SET FOREIGN_KEY_CHECKS = 0;

                        DELETE EventRequest, Request
                        FROM EventRequest
                        INNER JOIN Request ON
                        Request.request_id = EventRequest.request_id
                        WHERE Request.user_id = ? AND EventRequest.event_id = ?;
                    
                        SET FOREIGN_KEY_CHECKS = 1;`;

                    db.connection.query(sql, [uid, ugid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                default: {
                    res.sendStatus(400);
                    break;
                }
            }
        }
        else if (status === 'invited') {
            switch(value) {
                case '1': {
                    // if user accepted invitation 
                    const sql = `
                        INSERT INTO UserGroupMembership VALUES(?, ?);

                        UPDATE Invite 
                        INNER JOIN UserGroupInvite ON 
                        UserGroupInvite.invite_id = Invite.invite_id
                        SET Invite.decision = ? 
                        WHERE Invite.user_id = ? AND UserGroupInvite.usergroup_id = ?`;   
                        
                    db.connection.query(sql, [uid, ugid, states[value], uid, ugid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                case '2': {
                    // if user rejected invitation
                    const sql = `
                        SET FOREIGN_KEY_CHECKS = 0;

                        DELETE EventInvite, Invite 
                        FROM EventInvite
                        INNER JOIN Invite ON
                        Invite.invite_id = EventInvite.invite_id
                        WHERE Invite.user_id = ? AND EventInvite.event_id = ?;
                    
                        SET FOREIGN_KEY_CHECKS = 1;`;

                    db.connection.query(sql, [uid, ugid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                default: {
                    res.sendStatus(400);
                    break;
                }
            }
        }
        else {
            return res.sendStatus(400);
        }
    });

    // delete method (delete user's usergroup)
    app.delete('/api/v1/users/:uid/usergroups/:ugid', (req: Request, res: Response) => {
        if (req.body.key != '5736ac861c2e50e0a2223dab84502a7e08bd904d'){
            return res.sendStatus(401).send('You shall not pass');
        }
        
        const uid = req.params.uid;
        const ugid = req.params.ugid;
        if (!uid || !ugid) {
            return res.sendStatus(400);
        }

        const sql = `DELETE FROM UserGroupMembership 
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
        const uid = req.params.uid;
        const filter_by = req.body.filter_by;
        if (!uid) {
            return res.sendStatus(400);
        }

        if (filter_by === 'confirmed') {
            const sql = `(SELECT * FROM Event
                INNER JOIN SingularAttendance ON
                    SingularAttendance.event_id = Event.event_id
                WHERE SingularAttendance.user_id = ?)
                UNION ALL
                (SELECT * FROM Event
                INNER JOIN RecurringAttendance ON
                    RecurringAttendance.event_id = Event.event_id
                WHERE RecurringAttendance.user_id = ?)`;
           
            db.connection.query(sql, [uid, uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
               
                // include links to each event
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["event_link"] = "http://localhost:3000/api/v1/events/"
                        + results[i]["event_id"];
                }
                return res.send({
                    "confirmed": results
                });
            });
        }
        else if (filter_by === 'requested') {
            const sql = `SELECT * FROM Event
                INNER JOIN EventRequest ON
                    EventRequest.event_id = Event.event_id
                INNER JOIN Request ON
                    Request.request_id = EventRequest.request_id  
                WHERE Request.user_id = ?`;
 
            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                // include links to each event
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["event_link"] = "http://localhost:3000/api/v1/events/"
                        + results[i]["event_id"];
                }
                return res.send({
                    "requested": results
                });
            });
        }
        else if (filter_by === 'invited') {
            const sql = `SELECT * FROM Event
                INNER JOIN EventInvite ON
                    EventInvite.event_id = Event.event_id
                INNER JOIN Invite ON
                    Invite.invite_id = EventInvite.invite_id  
                WHERE Invite.user_id = ?`;
 
            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                // include links to each event
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["event_link"] = "http://localhost:3000/api/v1/events/"
                        + results[i]["event_id"];
                }
                return res.send({
                    "invited": results
                });
            });
        }
        else if (filter_by === 'organizing') {
            const sql = `SELECT * FROM Event
                INNER JOIN Organizer ON
                    Organizer.event_id = Event.event_id
                WHERE Organizer.user_id = ?`;
           
            db.connection.query(sql, [uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                // include links to each event
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["event_link"] = "http://localhost:3000/api/v1/events/"
                        + results[i]["event_id"];
                }
                return res.send({
                    "organizing": results
                });
            });
        }
        else {
            const sql = `
                SELECT * FROM Event
                INNER JOIN Organizer ON
                    Organizer.event_id = Event.event_id
                WHERE Organizer.user_id = ?;
 
                (SELECT * FROM Event
                INNER JOIN SingularAttendance ON
                    SingularAttendance.event_id = Event.event_id
                WHERE SingularAttendance.user_id = ?)
                UNION ALL
                (SELECT * FROM Event
                INNER JOIN RecurringAttendance ON
                    RecurringAttendance.event_id = Event.event_id
                WHERE RecurringAttendance.user_id = ?);
 
                SELECT * FROM Event
                INNER JOIN EventInvite ON
                    EventInvite.event_id = Event.event_id
                INNER JOIN Invite ON
                    Invite.invite_id = EventInvite.invite_id  
                WHERE Invite.user_id = ?;
 
                SELECT * FROM Event
                INNER JOIN EventRequest ON
                    EventRequest.event_id = Event.event_id
                INNER JOIN Request ON
                    Request.request_id = EventRequest.request_id  
                WHERE Request.user_id = ? `;
           
            db.connection.query(sql, [uid, uid, uid, uid, uid], (error, results, fields) => {
                if (error) {
                    return res.sendStatus(500);
                }
                // include links to each event
                for (let i = 0; i < Object.keys(results).length; i++) {
                    results[i]["event_link"] = "http://localhost:3000/api/v1/events/"
                        + results[i]["event_id"];
                }
                return res.send({
                    "organizing": results[0],
                    "confirmed": results[1],
                    "invited": results[2],
                    "requested": results[3]
                });
            });
        }
    });

    /* /users/:uid/events/:eid endpoint */

    // Get method (get specific event (can be single or recurring single))
    app.get('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        const eid = req.params.eid;
        if (!uid || !eid) {
            return res.sendStatus(400);
        }

        const sql = ` (SELECT * FROM Event
            INNER JOIN SingularAttendance ON
                SingularAttendance.event_id = Event.event_id
            WHERE 
                SingularAttendance.user_id = ? AND SingularAttendance.event_id = ?)
            UNION ALL
            (SELECT * FROM Event
            INNER JOIN RecurringAttendance ON
                RecurringAttendance.event_id = Event.event_id
            WHERE
                RecurringAttendance.user_id = ? AND RecurringAttendance.event_id = ?);

            SELECT * FROM OneTimeEvent
            INNER JOIN SingularAttendance ON
                SingularAttendance.event_id = OneTimeEvent.event_id
            WHERE OneTimeEvent.event_id = ? AND SingularAttendance.user_id = ?;

            SELECT * FROM RecurringSingleEvent
            INNER JOIN RecurringEvent ON
                RecurringEvent.recurringevent_id = RecurringSingleEvent.recurringevent_id
            INNER JOIN RecurringAttendance ON
                RecurringAttendance.event_id = RecurringEvent.event_id
            WHERE RecurringEvent.event_id = ? AND RecurringAttendance.user_id = ?;`;

        db.connection.query(sql, [uid, eid, uid, eid, eid, uid, eid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "event": results[0][0],
                "attend_OneTimeEvent": results[1][0],
                "attend_RecurringEvent": results[2][0]
            });
        });
    });

    // PUT Method (update user's status at event (Confirmed, Invited))
    app.put('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        const eid = req.params.eid;
        const status = req.body.status;
        const value = req.body.value;
        
        if (!uid || !eid || !status || !value) {
            return res.sendStatus(400);
        }

        if (status === 'requested') {
            switch(value) {
                case '1': {
                    // if admin accepted request 
                    const sql_check_1 = `SELECT * FROM OneTimeEvent
                        WHERE event_id = ?`;
                    db.connection.query(sql_check_1, [eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        
                        if (!isEmpty(results)) {
                            const sql = `
                                INSERT INTO SingularAttendance VALUES(?, ?);
                                UPDATE Request 
                                INNER JOIN EventRequest ON 
                                EventRequest.request_id = Request.request_id
                                SET Request.decision = ? 
                                WHERE Request.user_id = ? AND EventRequest.event_id = ?`;

                            db.connection.query(sql, [uid, eid, 1, uid, eid], (error, results, fields) => {
                                if (error) {
                                    return res.sendStatus(500);
                                }
                                return res.sendStatus(200);
                            });
                        }
                    });
            
                    const sql_check_2 = `SELECT * FROM RecurringEvent
                        WHERE event_id = ?`;
                    db.connection.query(sql_check_2, [eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        
                        if (!isEmpty(results)) {
                            const sql = `
                                INSERT INTO RecurringAttendance VALUES(?, ?);
                                UPDATE Request 
                                INNER JOIN EventRequest ON 
                                EventRequest.request_id = Request.request_id
                                SET Request.decision = ? 
                                WHERE Request.user_id = ? AND EventRequest.event_id = ?`;
                            
                            db.connection.query(sql, [uid, eid, 1, uid, eid], (error, results, fields) => {
                                if (error) {
                                    return res.sendStatus(500);
                                }
                                return res.sendStatus(200);
                            });
                        }
                    });
                    break;
                }
                case '2': {
                    // if admin declined request
                    const sql = `
                        SET FOREIGN_KEY_CHECKS = 0;

                        delete EventRequest, Request
                        FROM EventRequest
                        INNER JOIN Request ON
                        Request.request_id = EventRequest.request_id
                        WHERE Request.user_id = ? AND EventRequest.event_id = ?;
                    
                        SET FOREIGN_KEY_CHECKS = 1;`;

                    db.connection.query(sql, [uid, eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                default: {
                    res.sendStatus(400);
                    break;
                }
            }
        }
        else if (status === 'invited') {
            switch(value) {
                case '1': {
                    // if admin accepted request 
                    const sql_check_1 = `SELECT * FROM OneTimeEvent
                        WHERE event_id = ?`;
                    db.connection.query(sql_check_1, [eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        
                        if (!isEmpty(results)) {
                            const sql = `
                                INSERT INTO SingularAttendance VALUES(?, ?);
                                UPDATE Invite 
                                INNER JOIN UserGroupInvite ON 
                                UserGroupInvite.invite_id = Invite.invite_id
                                SET Invite.decision = ? 
                                WHERE Invite.user_id = ? AND UserGroupInvite.usergroup_id = ?`;

                            db.connection.query(sql, [uid, eid, states[value], uid, eid], (error, results, fields) => {
                                if (error) {
                                    return res.sendStatus(500);
                                }
                                return res.sendStatus(200);
                            });
                        }
                    });
            
                    const sql_check_2 = `SELECT * FROM RecurringEvent
                        WHERE event_id = ?`;
                    db.connection.query(sql_check_2, [eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        
                        if (!isEmpty(results)) {
                            const sql = `
                                INSERT INTO RecurringAttendance VALUES(?, ?);
                                UPDATE Invite 
                                INNER JOIN UserGroupInvite ON 
                                UserGroupInvite.invite_id = Invite.invite_id
                                SET Invite.decision = ? 
                                WHERE Invite.user_id = ? AND UserGroupInvite.usergroup_id = ?`;
                            
                            db.connection.query(sql, [uid, eid, states[value], uid, eid], (error, results, fields) => {
                                if (error) {
                                    return res.sendStatus(500);
                                }
                                return res.sendStatus(200);
                            });
                        }
                    });
                    break;
                }
                case '2': {
                    // if user rejected invitation
                    const sql = `
                        SET FOREIGN_KEY_CHECKS = 0;

                        delete EventInvite, Invite 
                        FROM EventInvite
                        INNER JOIN Invite ON
                        Invite.invite_id = EventInvite.invite_id
                        WHERE Invite.user_id = ? AND EventInvite.event_id = ?;
                    
                        SET FOREIGN_KEY_CHECKS = 1;`;

                    db.connection.query(sql, [uid, eid], (error, results, fields) => {
                        if (error) {
                            return res.sendStatus(500);
                        }
                        return res.sendStatus(200);
                    });
                    break;
                }
                default: {
                    res.sendStatus(400);
                    break;
                }
            }
        }
        else {
            return res.sendStatus(400);
        }        
    });

    // delete method (remove event from user's events (delete event for user, for everyone if organizer))
    app.delete('/api/v1/users/:uid/events/:eid', (req: Request, res: Response) => {
        const uid = req.params.uid;
        const eid = req.params.eid;
        
        if (!uid || !eid) {
            return res.sendStatus(400);
        }

        // disable the foreign key check
        // re-enable foreign key check.
        // SET FOREIGN_KEY_CHECKS
        const sql = `
            DELETE FROM SingularAttendance
                WHERE SingularAttendance.user_id = ? AND SingularAttendance.event_id = ?;

            DELETE FROM RecurringAttendance    
                WHERE RecurringAttendance.user_id = ? AND RecurringAttendance.event_id = ?;

            DELETE FROM Organizer
                WHERE Organizer.user_id = ? AND Organizer.event_id = ?;`;

        db.connection.query(sql, [uid, eid, uid, eid, uid, eid, uid, eid, uid, eid], 
            (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /*  /users/<uid>/products endpoint  */

    // Get method (get all products by the user (as seller))
    app.get('/api/v1/users/:uid/products', (req: Request, res: Response) => {
        const uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM Product WHERE seller_id = ?`;
        db.connection.query(sql, [uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "products": results
            });
        });
    });

    /* /users/<uid>/chats endpoint  */
    app.get('/api/v1/users/:uid/chats', (req: Request, res: Response) => {
        const uid = req.params.uid;
        if (!uid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM Chat WHERE buyer_id = ? OR seller_id = ?`;
        db.connection.query(sql, [uid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                "chats": results
            });
        });
    });
};