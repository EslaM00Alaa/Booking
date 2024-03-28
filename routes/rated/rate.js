


const express = require("express"),
  client = require("../../database/db"),
  path = require("path"), 
  fs = require("fs"),
  verifyToken = require("../../utils/veifytoken"),
 { validateRate } = require("../../models/rate");
  router = express.Router();





  router.post("/add/:ratedId", async (req, res) => {
    try {
        let rated_id = req.params.ratedId; // Corrected parameter name to match the route
        let id = verifyToken(req.headers.token).id; // Corrected header name to match 'headers'
        const { error } = validateRate(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });
        let rate = req.body.rate;

        let result = await client.query("SELECT * FROM rated WHERE user_id = $1 AND rated_id = $2", [id, rated_id]); // Corrected SQL query and added parameters
        if (result.rows.length > 0) {
            // Update rated record
            await client.query("UPDATE rated SET rate = $1 WHERE user_id = $2 AND rated_id = $3", [rate, id, rated_id]);
        } else {
            // Insert new rated record
            await client.query("INSERT INTO rated (user_id, rated_id, rate) VALUES ($1, $2, $3)", [id, rated_id, rate]);
        }

        // Calculate the average rate
        let rateAfter = (await client.query("SELECT SUM(rate) / COUNT(rated_id) AS rate FROM rated WHERE rated_id = $1", [rated_id])).rows[0].rate;

        res.json({ rate: rateAfter });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});





router.get("/add/:ratedId", async (req, res) => {
  try {
      let rated_id = req.params.ratedId; // Corrected parameter name to match the route
      let rateAfter = (await client.query("SELECT SUM(rate) / COUNT(rated_id) AS rate FROM rated WHERE rated_id = $1", [rated_id])).rows[0].rate;
      res.json({ rate: rateAfter });

  } catch (error) {
      return res.status(500).json({ msg: error.message });
  }
});



















  module.exports=router ;
