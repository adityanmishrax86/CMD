const path = require('path');
const fs = require(`fs`);
const chalk = require('chalk');
const axios = require("axios");
const os = require("os");

const omsPath = path.join(os.homedir(), ".oms")

const login = async (email, api, password) => {

    const data = {
        grant_type: 'password',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: api,
        username: email,
        password,
        header: "content-type: application/x-www-form-urlencoded",
    }

    await axios.post(`${process.env.AUTH0_DOMIN}/oauth/token`, data).then(res => {
        fs.writeFile(path.join(omsPath, "context.json"), JSON.stringify(res.data), function (err) {
            if (err) throw err;
            console.log(chalk.bold.blueBright(`Context saved in ${path.join(omsPath, "context.json")}`));
        });
    }).catch(err => {
        if (err.response) {
            const { status, data } = err.response;
            if (status) {
                console.log(chalk.red(data.error));
                console.log(chalk.red(status + " " + data.error_description));
            }
        }
    })


}

module.exports = {
    login
}