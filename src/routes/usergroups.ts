import { Application, Request, Response } from "express";
import * as db from "../tools/db";

export const register = (app: Application) => {
    /* /usergroup endpoint */

    // Get method (get list of all usergroups)
    app.get("/api/v1/usergroup", (req: Request, res: Response) => {
        db.connection.query("SELECT * FROM UserGroup", (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                usergroups: results,
            });
        });
    });

    // Post method (create new usergroup)
    app.post("/api/v1/usergroup", (req: Request, res: Response) => {
        const title = req.body.title;
        const descrip = req.body.descrip;
        const max_capacity = req.body.max_capacity;

        if (!title || !descrip || !max_capacity) {
            return res.sendStatus(400);
        }

        const sql = `INSERT INTO UserGroup (title, max_capacity, descrip) VALUES(?, ?, ?)`;
        db.connection.query(sql, [title, max_capacity, descrip], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    /* /usergroup/:ugid */

    // Get method (Get specific UserGroup)
    app.get("/api/v1/usergroup/:ugid", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }

        const sql = `SELECT * FROM UserGroup WHERE usergroup_id = ?`;
        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                usergroup: results,
            });
        });
    });

    // PUT Method (Update Existing UserGroup)
    app.put("/api/v1/usergroup/:ugid", (req: Request, res: Response) => {
        // restrict PUT (only admin or own user)
        if (req.body.key !== "5736ac861c2e50e0a2223dab84502a7e08bd904d") {
            return res.sendStatus(401).send("You shall not pass");
        }

        const ugid = req.params.ugid;
        const title = req.body.title;
        const max_capacity = req.body.max_capacity;
        const descrip = req.body.descrip;

        if (!ugid || !title || !descrip || !max_capacity) {
            return res.sendStatus(400);
        }

        const sql = `UPDATE UserGroup
            SET title = ?, max_capacity = ?, descrip = ?
            WHERE usergroup_id = ? `;

        db.connection.query(sql, [title, max_capacity, descrip, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    // Delete Method (Remove user group)
    app.delete("/api/v1/usergroup/:ugid", (req: Request, res: Response) => {
        // restrict DELETE (only admin or own user)
        if (req.body.key !== "5736ac861c2e50e0a2223dab84502a7e08bd904d") {
            return res.sendStatus(401).send("You shall not pass");
        }

        const ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }

        const sql = `DELETE FROM UserGroup WHERE usergroup_id = ?`;
        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /usergroup/:ugid/members */

    // Get method (get all members of usergroup)
    app.get("/api/v1/usergroup/:ugid/members", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }
        // const sql = `SELECT user_id FROM UserGroupMembership
        //    WHERE usergroup_id = ?`;
        const sql = `
            SELECT * FROM User
            INNER JOIN UserGroupMembership ON
            UserGroupMembership.user_id = User.user_id
            WHERE UserGroupMembership.usergroup_id = ?`;

        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                members: results,
            });
        });
    });

    // Post method (add new member to the usergroup)
    app.post("/api/v1/usergroup/:ugid/members", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const user_id = req.body.user_id;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }
        const sql = `INSERT INTO UserGroupMembership VALUES(?, ?)`;
        db.connection.query(sql, [user_id, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    // Delete Method (remove member from an usergroup)
    app.delete("/api/v1/usergroup/:ugid/members/:uid", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const uid = req.params.uid;

        if (!ugid || !uid) {
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

    /* /usergroup/:ugid/owners */

    // Get method (get all owners of an usergroup)
    app.get("/api/v1/usergroup/:ugid/owners", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }

        // const sql = `SELECT user_id FROM UserGroupOwner
        //    WHERE usergroup_id = ?`;
        const sql = `
            SELECT * FROM User
            INNER JOIN UserGroupOwner ON
            UserGroupOwner.user_id = User.user_id
            WHERE UserGroupOwner.usergroup_id = ?`;

        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                owners: results,
            });
        });
    });

    // Post method (add new owner to the usergroup)
    app.post("/api/v1/usergroup/:ugid/owners", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const user_id = req.body.user_id;

        if (!ugid || !user_id) {
            return res.sendStatus(400);
        }

        const sql = `INSERT INTO UserGroupOwner VALUES(?, ?)`;
        db.connection.query(sql, [user_id, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    // Delete Method (remove owner from an usergroup)
    app.delete("/api/v1/usergroup/:ugid/owners/:uid", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const uid = req.params.uid;

        if (!ugid || !uid) {
            return res.sendStatus(400);
        }
        const sql = `DELETE FROM UserGroupOwner
            WHERE user_id = ? AND usergroup_id = ?`;
        db.connection.query(sql, [uid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /usergroup/:ugid/invited */

    // Get method (get all invited users of an usergroup)
    app.get("/api/v1/usergroup/:ugid/invited", (req: Request, res: Response) => {
        const ugid = req.params.ugid;

        if (!ugid) {
            return res.sendStatus(400);
        }

        /*const sql = `SELECT Invite.user_id FROM Invite
            INNER JOIN UserGroupInvite ON Invite.invite_id = UserGroupInvite.invite_id
            WHERE UserGroupInvite.usergroup_id = ?`; */

        const sql = `
            SELECT * FROM User
            INNER JOIN Invite ON
            Invite.user_id = User.user_id
            INNER JOIN UserGroupInvite ON
            Invite.invite_id = UserGroupInvite.invite_id
            WHERE UserGroupInvite.usergroup_id = ?`;

        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                invited: results,
            });
        });
    });

    // Post method (invite new user to an usergroup)
    app.post("/api/v1/usergroup/:ugid/invited", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const message = req.body.message || "You have been invited to an usergroup";
        const uid = req.body.uid;

        if (!ugid || !uid) {
            return res.sendStatus(400);
        }

        const sql = `
            INSERT INTO Invite (user_id, message)
            VALUES(?, ?);

            INSERT INTO UserGroupInvite (invite_id, usergroup_id)
            SELECT Invite.invite_id, ?
            FROM Invite
            WHERE Invite.user_id = ?; `;

        db.connection.query(sql, [uid, message, ugid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    // Delete Method (remove invitation of user to usergroup)
    app.delete("/api/v1/usergroup/:ugid/invited/:uid", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const inviteid = req.params.uid;

        if (!ugid || !inviteid) {
            return res.sendStatus(400);
        }

        const sql = `DELETE FROM UserGroupInvite
            WHERE invite_id = ? AND usergroup_id = ?`;
        db.connection.query(sql, [inviteid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });

    /* /usergroup/:ugid/requested */

    // Get method (get all requested users of usergroup)
    app.get("/api/v1/usergroup/:ugid/requested", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        if (!ugid) {
            return res.sendStatus(400);
        }

        const sql = `
            SELECT * FROM User
            INNER JOIN Request ON
            Request.user_id = User.user_id
            INNER JOIN GroupRequest ON
            GroupRequest.request_id = Request.request_id
            WHERE GroupRequest.usergroup_id = ?`;

        db.connection.query(sql, [ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.send({
                requested: results,
            });
        });
    });

    // Post method (add a new request to join an usergroup)
    app.post("/api/v1/usergroup/:ugid/requested", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const message = req.body.message || "You have requested to join an usergroup";
        const uid = req.body.uid;

        if (!ugid || !uid) {
            return res.sendStatus(400);
        }

        // const sql = `INSERT INTO GroupRequest VALUES(?, ?)`;

        const sql = `
            INSERT INTO Request (user_id, message)
            VALUES(?, ?);

            INSERT INTO GroupRequest (request_id, usergroup_id)
            SELECT Request.request_id, ?
            FROM Request
            WHERE Request.user_id = ?;`;

        db.connection.query(sql, [uid, message, ugid, uid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(201);
        });
    });

    // Delete method (remove request to join an usergroup)
    app.delete("/api/v1/usergroup/:ugid/requested/:uid", (req: Request, res: Response) => {
        const ugid = req.params.ugid;
        const requestid = req.params.uid;

        if (!ugid || !requestid) {
            return res.sendStatus(400);
        }

        const sql = `DELETE FROM GroupRequest
            WHERE request_id = ? AND usergroup_id = ? `;
        db.connection.query(sql, [requestid, ugid], (error, results, fields) => {
            if (error) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });
};
