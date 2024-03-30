const express = require("express"),
  client = require("../../database/db"),
  router = express.Router();


  router.get("/",async(req,res)=>{
    try {
        let result = await client.query("SELECT * FROM cities");
        res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
  })





module.exports = router ;