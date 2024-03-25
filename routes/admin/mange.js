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




  module.exports = router ; 



