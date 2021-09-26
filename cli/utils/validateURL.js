function validateURL(url) {
    return (/^http(s)?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/g).test(url);
}

module.exports = validateURL;