function validateEmail(mail)
{
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(mail);

}

module.exports = validateEmail;