import express from 'express';
import mysql from 'mysql';

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



app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});