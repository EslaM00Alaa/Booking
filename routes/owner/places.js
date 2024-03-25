const isOwner = require("../../middleware/isOwner");
const photoUpload = require("../../utils/uploadimage");

const express = require("express"),
{validatePlace} = require("../../models/place"),
client = require("../../database/db"),
router = express.Router();




router.post("/place",photoUpload.array("image"),isOwner , async (req, res) => {
    try {
        if (req.body) {
            const { error } = validatePlace(req.body);
            if (error) return res.status(400).json({ msg: error.details[0].message });

            const {
                id, name, address, description, location, min_hours, hour_salary, days,category
            } = req.body;

        
            const result = await client.query("INSERT INTO places (owner_id,category_id,name,address,description,location,min_hours,hour_salary) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;", [id,category,name, address, description, location, min_hours, hour_salary]);
            const place_id = result.rows[0].id;

            // Check if images are uploaded
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const imagePath = `http://localhost:6666/images/${req.files[i].filename}`; // Assuming images are stored in the "images" folder
                    await client.query("INSERT INTO places_images (place_id,image) VALUES ($1,$2);", [place_id, imagePath]);
                }
            } else {
                return res.status(400).json({ msg: "Images are required" });
            }

            // Insert free days
            for (let i = 0; i < days.length; i++) {
                await client.query("INSERT INTO free_day (place_id,day_id) VALUES ($1,$2);", [place_id, days[i]]);
            }
            res.status(200).json({ msg: "Place created successfully",place_id});
        } else {
            res.status(403).json({ msg: "You don't have permission to create a place. Your account is not active." });
        }
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});


router.post("/place/attachment/:placeid", photoUpload.single("image"), isOwner, async (req, res) => {
    try {
     let place_id = req.params.placeid;
    
      let imagePath = null;
  
      if (req.file) {
        imagePath = `http://localhost:6666/images/${req.file.filename}`;
        // Insert the owner_id and attachment path into the owner_attachment table
        await client.query("INSERT INTO place_attachment (place_id, attachment) VALUES ($1, $2)", [place_id, imagePath]);
        res.status(200).json({ msg: "Image uploaded successfully" });
      } else {
        // If no file is uploaded, return an error response
        res.status(400).json({ msg: "You must send an image" });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
  


module.exports=router;