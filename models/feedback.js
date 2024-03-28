const joi = require("joi");



function validateFeedBack(obj)
{
    const schema = joi.object({
        description:joi.string().required(),
    })
    return schema.validate(obj)
}

module.exports = {
    validateFeedBack
}