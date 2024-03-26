const isAdmin = require("../../middleware/isAdmin.js");
const { validateCategory } = require("../../models/category.js");

const express = require("express"),
  client = require("../../database/db"),
  path = require("path"), // Add this line to import the path module
  fs = require("fs"),
  photoUpload = require("../../utils/uploadimage.js"),
  router = express.Router();


  router.post("/category", photoUpload.single("image"), isAdmin, async (req, res) => {
    try {
        const { error } = validateCategory(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });
        
        let imagePath = null;
        if (req.file) {
            imagePath = `http://localhost:6666/images/${req.file.filename}`; // Assuming images are stored in the "images" folder
        } else {
            return res.status(400).json({ msg: "Image is required" });
        }

        const { name } = req.body;
        await client.query("INSERT INTO category (name, image) VALUES ($1, $2)", [name, imagePath]);
        res.json({ msg: "Category inserted successfully" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }

});

router.get("/category",async(req,res)=>
{
    try {
        let result = await client.query("SELECT * FROM category ;");
        res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
})

router.put("/category/:id", photoUpload.single("image"), isAdmin, async (req, res) => {
    try {
       

        let name = req.body.name;
        let imagePath = null;
        if (req.file) {

            let lastimage = (await client.query("SELECT image FROM category WHERE id = $1", [req.params.id])).rows[0].image;

            if (lastimage) {
                const imagePath1 = path.join(
                    __dirname,
                    `../../${lastimage.replace("http://localhost:6666/", "")}`
                );
                fs.unlink(imagePath1, (err) => {
                    if (err) {
                        console.error("Error deleting image:", err);
                    }
                });
            }

            imagePath = `http://localhost:6666/images/${req.file.filename}`; // Assuming images are stored in the "images" folder
            await client.query("UPDATE category SET image = $1 WHERE id = $2;", [imagePath, req.params.id]);
        }
        if (name) {
            await client.query("UPDATE category SET name = $1 WHERE id = $2;", [name, req.params.id]);
        }
        res.json({ msg: "Done" });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});


router.delete("/category/:id",isAdmin,async(req,res)=>{
    try {
        await  client.query("DELETE FROM category WHERE id = $1;",[req.params.id]);
        res.json({msg:"one category deleted"});
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
})




router.post('/puler', photoUpload.single("image"), isAdmin, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "Image is required" });
        }

        const imagePath = `http://localhost:6666/images/${req.file.filename}`; // Assuming images are stored in the "images" folder
        await client.query("INSERT INTO pulers (img) VALUES ($1)", [imagePath]);

        res.json({ msg: "One puler inserted." });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


router.get('/puler', async (req, res) => {
    try {
        // Retrieve three random records from the pulers table
        const result = await client.query("SELECT * FROM pulers ORDER BY RANDOM() LIMIT 3");
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await client.query("DELETE FROM pulers WHERE id = $1 RETURNING *;", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: "Record not found" });
        }

        res.json({ msg: "Deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});




  module.exports = router ; 




