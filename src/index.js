import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';

const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'fydp',
  password: 'password',
  database: 'rendezvue'
});

connection.connect(err => {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }

  console.log("Connected as id: " + connection.threadId);
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});


// Get list of users
app.get('/users', (req, res) => {
  const sql = `SELECT userId, username FROM Users`;

  connection.query(sql, (err, results, fields) => {
    if (err) throw err;

    res.send(results);
  });
});

// Create a user
app.post('/users', (req, res) => {
  const body = req.body;
  const newUsername = body.username;
  const newUserPwd = body.userPassword;
  const existsSql = `SELECT username FROM Users WHERE username = '${newUsername}'`;
  const sql = `INSERT INTO Users (username, password, firstName, lastName) VALUES ('${newUsername}', '${newUserPwd}', 'FirstName', 'LastName')`;
  
  connection.query(existsSql,(err, results, fields) => {
    if (err) throw err;

    if (results.length == 0) {
      connection.query(sql, (err, results, fields) => {
        if (err) throw err;
        console.log("Success, User Created!");
        res.status(201).end();
      });
    } else {
      res.status(409).end();
    }
  });
});

// Authenticate a user
app.post('/login', (req, res) => {
  const body = req.body;
  const username = body.username;
  const userpwd = body.userPwd;
  const sql = `SELECT password, userId FROM Users WHERE username = '${username}'`;

  connection.query(sql, (err, results, fields) => {
    if (err) {
      res.status(400).send("User does not exist, please create an account!");
    }

    if (results.length == 0) { 
      res.status(400).send("User does not exist, please create an account!");
    } else {
      const actualPwd = results[0].password;
      console.log(userpwd);
      console.log(actualPwd);
      if (actualPwd == userpwd) {
        const userId = results[0].userId;
        res.status(202).send(userId + "");
      } else {
        res.status(401).send("Wrong password!");
      }
    }
  });
});

// Get all users within a room
app.get('/users/:userId/rooms/:roomId/usersInRoom', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const sql = `SELECT DISTINCT Users.userId, username, roomId FROM UserRoom INNER JOIN Users ON (UserRoom.userId = Users.userId) WHERE roomId = ${roomId} and Users.userId != ${userId}`;

  connection.query(sql, (err, results, fields) => {
    if (err) throw err;

    res.send(results);
  });
});

// Get all rooms a user belongs
app.get('/users/:userId/rooms', (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT roomId, roomName FROM Rooms INNER JOIN UserRoom USING(roomId) WHERE userId = ${userId}`;
  
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;

    res.send(results);
  });
});

// User creates a room
app.post('/users/:userId/rooms', (req, res) => {
  const userId = req.params.userId;
  const body = req.body;
  const roomName = body.roomName;

  connection.beginTransaction(function(err) {
    if (err) { throw err; }
    connection.query(`INSERT INTO Rooms (roomName) VALUES ('${roomName}')`, function(err, result) {
      if (err) { 
        connection.rollback(function() {
          throw err;
        });
      }
      const roomId = result.insertId;
      connection.query(`INSERT INTO UserRoom (roomId, userId) VALUES (${roomId}, ${userId})`, function(err, result) {
        if (err) { 
          connection.rollback(function() {
            throw err;
          });
        }  
        connection.commit(function(err) {
          if (err) { 
            connection.rollback(function() {
              throw err;
            });
          }
          console.log('Success! Room created!');
          res.status(201).end();
        });
      });
    });
  });
});

// User deletes a room
app.delete('/users/:userId/rooms/:roomId', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;

  connection.beginTransaction(function(err) {
    if (err) { throw err; }
    connection.query(`DELETE FROM UserRoom WHERE roomId = ${roomId} and userId = ${userId}`, function(err, result) {
      if (err) { 
        connection.rollback(function() {
          throw err;
        });
      }
      connection.query(`DELETE FROM Rooms WHERE roomId = ${roomId}`, function(err, result) {
        if (err) { 
          connection.rollback(function() {
            throw err;
          });
        }  
        connection.commit(function(err) {
          if (err) { 
            connection.rollback(function() {
              throw err;
            });
          }
          console.log('Success! Room deleted!');
          res.status(200).end();
        });
      });
    });
  });
});

// Get all markers of a room a user belongs to
app.get('/users/:userId/rooms/:roomId/markers', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const sql = `SELECT locationId, latitude, longitude, altitude, markerMetadata FROM Locations WHERE userId = ${userId} and roomId = ${roomId}`;
  
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    let mappedResults = {};
    let key = 'results';
    mappedResults[key] = [];
    for (let result of results) {
      mappedResults[key].push(result);
    }
    res.send(mappedResults);
  });
});

// Create a marker / replace marker if already exists
app.post('/users/:userId/rooms/:roomId/marker', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const body = req.body;
  const longitude = body.longitude;
  const latitude = body.latitude;
  const altitude = body.altitude;
  const markerMetadata = body.markerMetadata;

  const locationSql = `SELECT locationId FROM Locations WHERE userId = ${userId} and roomId = ${roomId}`;
  connection.query(locationSql, (err, results, fields) => {
    if (err) throw err;

    var sql = ``;
    if (results === undefined  || results.length == 0) {
      sql = `INSERT INTO Locations (userId, longitude, latitude, altitude, markerMetadata, roomId) 
            VALUES (${userId}, ${longitude}, ${latitude}, ${altitude}, '${markerMetadata}', ${roomId})`;
    } else {
      const locationId = results[0].locationId;
      sql = `INSERT INTO Locations (locationId, userId, longitude, latitude, altitude, markerMetadata, roomId) 
            VALUES (${locationId}, ${userId}, ${longitude}, ${latitude}, ${altitude}, '${markerMetadata}', ${roomId}) 
            ON DUPLICATE KEY UPDATE longitude = ${longitude}, latitude = ${latitude}, altitude = ${altitude}, markerMetadata = '${markerMetadata}'`;
    }
    connection.query(sql, (err, results, fields) => {
      if (err) throw err;
      res.status(201).end();
    });
  });
})

// Delete a marker
app.delete('/users/:userId/rooms/:roomId/marker', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const sql = `DELETE FROM Locations WHERE userId = ${userId} and roomId = ${roomId}`;
  connection.query(sql, (err, results, fields) => {
      if (err) throw err;
      console.log(`Marker for user ${userId} in room ${roomId} deleted!`);
      res.status(201).end();
    });
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});