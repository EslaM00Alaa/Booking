const isAdmin = require("../../middleware/isAdmin.js");


const express = require("express"),
  client = require("../../database/db"),
  router = express.Router();



  router.get("/places/requests", isAdmin, async (req, res) => {
    try {
      let result = await client.query(`
      SELECT 
      p.id AS place_id,
      p.owner_id,
      p.category_id,
      p.active,
      p.name AS place_name,
      p.address,
      p.description,
      p.nsign,
      p.location,
      p.min_hours,
      p.hour_salary,
      pi.images AS images,
      d.free_days
  FROM 
      places p
  LEFT JOIN (
      SELECT 
          place_id,
          ARRAY_AGG(image) AS images
      FROM 
          places_images
      GROUP BY 
          place_id
  ) pi ON p.id = pi.place_id
  LEFT JOIN (
      SELECT 
          place_id,
          ARRAY_AGG(name) AS free_days
      FROM 
          free_day fd
      JOIN 
          days d ON fd.day_id = d.id
      GROUP BY 
          place_id
  ) d ON p.id = d.place_id
  WHERE 
      p.active = false;
      `);
      res.json(result.rows);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  });



  router.put("/place/active/:id",isAdmin,async(req,res)=>{
    try {
        await client.query("UPDATE places SET active = true WHERE id = $1 ;",[req.params.id]);
        res.json({msg:"the place is active"});
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
  })

  module.exports = router ;