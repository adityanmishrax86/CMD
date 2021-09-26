const path = require('path');
const os = require("os");
const fs = require(`fs`);
const chalk = require('chalk');
const axios = require("axios");

const omsPath = path.join(os.homedir(), ".oms")

const createResults = async (answers) => {
    const createURL = "http://localhost:8080/post";

    fs.readFile(path.join(omsPath, "context.json"), "utf8", async (err, jsonString) => {
        if (err) {
            console.log(chalk.yellowBright("Session Expired: Please Login Again!"));
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const res = await axios.post(createURL, answers, { headers: { 'authorization': `Bearer ${data?.access_token}` } });
            console.log((res.data))
        } catch (err) {
            if (err?.response?.status === 401)
                console.log(chalk.redBright("401 Unauthorized Error"));
            else
                console.log(chalk.red("Error parsing JSON string:"));
        }
    });

}

module.exports = {
    createResults
}