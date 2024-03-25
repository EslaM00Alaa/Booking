const isAdmin = require("../../middleware/isAdmin.js");


const express = require("express"),
  client = require("../../database/db"),
  router = express.Router();



  router.get("/owner/requests", isAdmin, async (req, res) => {
    try {
      let result = await client.query(`
        SELECT o.id, o.user_name, o.mail, 
               ARRAY_AGG(a.attachment) AS attachments
        FROM users o
        LEFT JOIN owner_attachment a ON o.id = a.owner_id
        WHERE o.role = 'owner' AND o.active = false
        GROUP BY o.id, o.user_name, o.mail;
      `);
      res.json(result.rows);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  });

  router.put("/active/:id",isAdmin,async(req,res)=>{
    try {
        await client.query("UPDATE users SET active = true WHERE id = $1 ;",[req.params.id]);
        res.json({msg:"the account is active"});
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
  })

  module.exports = router ;