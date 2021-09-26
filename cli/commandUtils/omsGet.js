const path = require('path');
const fs = require(`fs`);
const chalk = require('chalk');
const axios = require("axios");
const os = require("os");

const omsPath = path.join(os.homedir(), ".oms")


const getResults = async (id = null) => {
    const getURL = 'http://localhost:8080/posts'
    fs.readFile(path.join(omsPath, "context.json"), "utf8", async (err, jsonString) => {
        if (err) {
            console.log(chalk.yellowBright("Session Expired. Please Login Again!"));
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const headers = { 'authorization': `Bearer ${data?.access_token}` };
            let response;
            if (id)
                response = await axios.get(`${getURL}/${id}`, { headers })
            else
                response = await axios.get(getURL, { headers });
            console.log(response.data)
        } catch (err) {
            if (err?.response?.status === 401)
                console.log(chalk.redBright("401 Unauthorized Error"));
            else if (err.code === "ECONNREFUSED")
                console.log(chalk.red("Unable to connect to the Server"));
            else
                console.log(chalk.red("Error parsing JSON string"));

        }
    });
}

module.exports = {
    getResults
}