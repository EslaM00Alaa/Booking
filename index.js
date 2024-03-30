isReady = require("./database/dbready");

require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  app = express(),
  port = process.env.PORT,
  helmet = require("helmet"),
  path = require("path"),
  client = require("./database/db");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());


app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api",require("./routes/user/auth"))
app.use("/api",require("./routes/admin/auth"))
app.use("/api",require("./routes/owner/auth"))
app.use("/api",require("./routes/admin/mange"))
app.use("/api",require("./routes/admin/owner_requests"))
app.use("/api",require("./routes/admin/places_request"))
app.use("/api",require("./routes/owner/places"))
app.use("/api/user",require("./routes/user/info"))
app.use("/api/rate",require("./routes/rated/rate"))
app.use("/api/feedback",require("./routes/user/feedback"))
app.use("/api/cities",require("./routes/cities/getCities"))









app.get('/dealltable', async (req, res) => {
  try {
    const query = `SELECT 'DROP TABLE IF EXISTS "' || tablename || '" CASCADE;' FROM pg_tables WHERE schemaname = 'public';`;
    const result = await client.query(query);

    for (const row of result.rows) {
      const dropTableQuery = row['?column?'];
      await client.query(dropTableQuery);
    }

    res.json({ msg: "All tables deleted." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});   






client.connect().then(async() => {
    console.log("psql is connected ..");
    app.listen(port, () => console.log(`server run on port ${port} ...... `));
    await isReady();
  });