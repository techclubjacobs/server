import mysql from "mysql";

export const connection = mysql.createConnection({
    database: "JacobsApp",
    host: "localhost",
    multipleStatements: true,
    password: "root",
    port: 3306,
    user: "root",
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});
