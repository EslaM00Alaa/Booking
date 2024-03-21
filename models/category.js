const joi = require("joi");



function validateCategory(obj)
{
    const schema = joi.object({
        name:joi.string().trim().required(),
        id:joi.number(),
        mail:joi.string()
    })
    return schema.validate(obj)
}

module.exports = {
    validateCategory
}