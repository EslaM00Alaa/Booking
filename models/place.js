const joi = require("joi");

function validatePlace(obj) {
    const schema = joi.object({
        name: joi.string().trim().required(),
        address: joi.string().trim().required(),
        description: joi.string().trim().required(),
        city:joi.number().required(),
        min_hours: joi.number().required(),
        hour_salary: joi.number().required(),
        category:joi.number().required(),
        days: joi.array().items(joi.number()) ,// Corrected the validation for array of numbers
        id:joi.number(),
        mail:joi.string(),
        active:joi.boolean()
    });
    return schema.validate(obj);
}

module.exports = {
    validatePlace
};
