import mysql from 'mysql';

export const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'JacobsApp',
    port: 3306
});

connection.connect(function(err) {
    if (err) console.log(err);
});