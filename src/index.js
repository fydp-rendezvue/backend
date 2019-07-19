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

app.get('/users', (req, res) => {
  const sql = `SELECT userId, username, firstName, lastName FROM Users`

  connection.query(sql, (err, results, fields) => {
    if (err) throw err;

    res.send(results);
  });
});

app.get('/users/:userId/rooms', (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT roomId, roomName FROM Rooms INNER JOIN UserRoom USING(roomId) WHERE userId = ${userId}`;
  
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;

    res.send(results);
  });
});

// app.post('/users/:userId/rooms', (req, res) => {
//   const userId = req.params.userId;
//   const body = req.body;
//   const roomId = body.roomId;
//   const roomName = body.roomName;
//   const sql = 
//     `START TRANSACTION;
//     INSERT INTO Rooms (roomId, roomName) VALUES (${roomId}, ${roomName});
//     INSERT INTO UserRoom (roomId, userId) VALUES (${roomId}, ${userId});
//     COMMIT;`;
//   connection.query(sql, (err, results, fields) => {
//     if (err) throw err;

//     res.send(results);
//   });
// });

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

app.post('/users/:userId/rooms/:roomId/marker', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const body = req.body;
  const longitude = body.longitude;
  const latitude = body.latitude;
  const altitude = body.altitude;
  const markerMetadata = body.markerMetadata;

  const sql = `INSERT INTO Locations (userId, longitude, latitude, altitude, markerMetadata, roomId) VALUES (${userId}, ${longitude}, ${latitude}, ${altitude}, '${markerMetadata}', ${roomId})`;
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    res.status(201).end();
  });
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});