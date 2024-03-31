const express = require("express"),
  client = require("../../database/db"),
  router = express.Router();


  router.get("/places/category/:idCategory/:city/:limit/:pageN", async (req, res) => {
    try {
        let category_id = req.params.idCategory;
        let size = req.params.limit;
        let pageN = req.params.pageN;
        let city = req.params.city;

        let result = await client.query("SELECT p.name, p.address, p.description, p.hour_salary, pi.image FROM places p LEFT JOIN places_images pi ON p.id = pi.place_id WHERE p.active = true AND p.city = $1 AND p.category_id = $2 LIMIT $3 OFFSET $4", [city, category_id, size, (pageN - 1) * size]);

        res.json(result.rows);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Internal server error' }); // Send an error response
    }
});





  module.exports = router ;
