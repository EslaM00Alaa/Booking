
const express = require("express"),
  client = require("../../database/db"),
  router = express.Router();

  router.get("/:id", async (req, res) => {
    try {
        let result = await client.query(`
        SELECT 
        u.image,
        u.id,
        u.user_name,
        u.mail,
        u.money,
        (
            SELECT SUM(rate) / COUNT(rated_id) AS rate FROM rated WHERE rated_id = u.id
        ) AS rate,
        ARRAY(
            SELECT 
                f.description
            FROM 
                feedbacks f 
            WHERE 
                f.writer_id = u.id AND f.writed_id = u.id
        ) AS feedbacks
    FROM 
        users u 
    WHERE 
        u.id = $1;
    
        `, [req.params.id]);

        res.json(result.rows[0]); // Assuming there's only one row expected
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});















  module.exports = router ;