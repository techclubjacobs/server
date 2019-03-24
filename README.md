# Jacobs App Server

This server consists of a MySQL database and a Node & Express backend. The project is written in TypeScript, as is the Jacobs web application. The server provides a RESTful API for database access. 

## Local Development Setup

### MySQL database

Start by installing mysql, either directly (from here: [mac](https://dev.mysql.com/doc/refman/5.7/en/osx-installation-pkg.html), [linux](https://dev.mysql.com/doc/mysql-linuxunix-excerpt/5.7/en/linux-installation.html)), or using an app such as MAMP ([download](https://www.mamp.info/en/)) and then run the mysql database server. 

Login to the mysql server (on localhost) and run the following script:

```bash
mysql> source ./src/tools/create_db.sql;
```

This will setup a database called `JacobsApp` with all the necessary tables.

If you ever need to reset the database, run the following inside your mysql environment:

```bash
mysql> drop database JacobsApp;
mysql> source ./src/tools/create_db.sql
```

### Node Server

Now, run 

```bash
npm run watch-ts
```

for the compilation in watch mode - this will show you any errors/warnings at compile time.

Also run

```bash
npm run watch-node
```

to actually run the API server.

### Postman

In order to test API endpoints, it's very convenient to have an application that helps you make these requests. You can just do the requests using `curl` on the command line, but apps such as *Postman* will make your life much easier. Download Postman [here](https://www.getpostman.com) for free. 

## Project Structure

The project directory has the following structure:

```
dist
	...
node_modules
	...
src
	routes
		...
	tools
		...
	server.ts
package-lock.json
package.json
README.md
tsconfig.json
tslint.json
```

The directory `dist` contains the compiled JavaScript files from the project - you don't write to this folder and it's not committed to Git. The directory `node_modules` contains all the installed modules for the Node environment - you don't write to this folder either and it's not committed to Git either. 

The `src` directory is where we work. `src/routes` contains files for each API resource endpoint (such as `users.ts`, `chats.ts` and so on). `src/tools` contains other tools, such as SQL scripts and the database worker `src/tools/db.ts`. The file `src/server.ts` has the general server setup - it registers all the routes from `src/routes` and starts the server.

The `package-lock.json` and `package.json` files contain information about all the node packages for this project. You usually don't modify these files and they are committed to Git. The `README.md` file is what you're reading right now (duh), the `tsconfig.json` file contains TypeScript configurations and `tslint.json` sets up Lint for the project.

## API Structure

You can find a detailed overview of all API endpoints that are needed in the wiki pages of the app project [here](https://github.com/techclubjacobs/app/wiki/Server-(API)) (there, you can also find a detailed overview of the MySQL database). 

We use the RESTful API verbs from standard HTTP requests (`GET` for getting data, `POST` for uploading data, `PUT` for updating data and `DELETE` for deleting data) in all API endpoints. 

The general API structure is to use URIs starting with `/api/v1/`, following with the resource name (e.g. `/api/v1/users`). 

For each API end point, we check the incoming request, make sure it's valid (assert that all necessary data is in the query and, if applicable, make sure that the user making the request has the authentication to access this API endpoint), run the SQL query and return data (if no data is returned, just return a `200 OK` status code). 

Make sure to make use of relevant HTTP status codes - and be as detailed as possible. 