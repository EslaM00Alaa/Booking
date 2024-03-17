const joi = require("joi");



function validateUser(obj)
{
    const schema = joi.object({
        user_name:joi.string().trim().required(),
        mail:joi.string().trim().required().email(),
        pass:joi.string().trim().max(30).required()
    })
    return schema.validate(obj)
}


function validateLogin(obj)
{
    const schema = joi.object({
        mail:joi.string().trim().required().email(),
        pass:joi.string().trim().max(30).required()
    })
    return schema.validate(obj)
}

function validateEmail (obj) {
    const schema = joi.object({
        mail:joi.string().trim().min(5).max(100).required().email(),
    })
    return schema.validate(obj)
}
function validateChangePass (obj)
{
    const schema = joi.object({
        mail:joi.string().trim().min(5).max(100).required().email(),
        pass:joi.string().trim().max(300).required(),
        code:joi.string().trim().required(),
    })
    return schema.validate(obj)
}
module.exports = {validateUser,validateLogin,validateEmail,validateChangePass}