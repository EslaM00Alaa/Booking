const joi = require("joi");



function validateFeedBack(obj)
{
    const schema = joi.object({
        id:joi.number().required(),
        mail:joi.string(),
        description:joi.string(),
        role:joi.string(),
        writed_id:joi.number().required()
    })
    return schema.validate(obj)
}

module.exports = {
    validateFeedBack
}