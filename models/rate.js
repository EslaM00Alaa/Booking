const joi = require("joi");

function validateRate(obj) {
    const schema = joi.object({
        rate: joi.number().required()
    });
    return schema.validate(obj);
}

module.exports = {
    validateRate
};
