const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");

app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const { Pool } = require("pg");

const db = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.removeHeader("Permissions-Policy");
  next();
});

// GET "/"
app.get("/", function (req, res) {
  let order = "desc";
  order = req.query.order;
  db.query(`SELECT * FROM videos order by rating ${order}`)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

//DELETE '/:id'
app.delete("/:id", function (request, response) {
  let newId = request.params.id;
  db.query(`DELETE FROM videos WHERE id=${newId} RETURNING *`)
    .then((result) => {
      response.json(result.rows[0]);
    })
    .catch((err) => res.status(500).json({ error: err }));
});

//POST '/:id'
app.post("/", (request, response) => {
  const rating = Math.floor(Math.random() * 10000);
  let { title, url } = request.body;
  let newVideo = { title, url, rating };

  if (
    newVideo.title &&
    newVideo.url &&
    newVideo.title.length > 0 &&
    newVideo.url.length > 0
  ) {
    db.query(
      `INSERT INTO videos (title, url, rating)
    VALUES ($1, $2, $3)
    RETURNING *`,
      [newVideo.title, newVideo.url, newVideo.rating]
    )
      .then((result) => {
        response.status(201).json(result.rows[0]);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  } else {
    response.status(400).json({
      result: "failure",
      message: "Video could not be saved",
    });
  }
});

//GET '/:id'
app.get("/:id", (request, response) => {
  const newId = Number(request.params.id);
  db.query(`Select * from videos where id=$1`, [newId])
    .then((result) => {
      response.status(200).json(result.rows[0]);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});
