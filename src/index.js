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

app.get('/users/:userId/rooms', (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT roomId FROM Rooms WHERE userId = ${userId}`;
  
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    let roomIds = [];
    for (let roomIdPair of results) {
      roomIds.push(Object.values(roomIdPair)[0]);
    }
    res.send(roomIds);
  });
});

app.post('/users/:userId/rooms/:roomId/marker', (req, res) => {
  const userId = req.params.userId;
  const roomId = req.params.roomId;
  const body = req.body;
  const longitude = body.longitude;
  const latitude = body.latitude;
  const markerMetadata = body.markerMetadata;

  const sql = `INSERT INTO Locations (userId, longitude, latitude, markerMetadata, roomId) VALUES (${userId}, ${longitude}, ${latitude}, '${markerMetadata}', ${roomId})`;
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    res.status(201).end();
  });
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});