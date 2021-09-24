#!/usr/bin/env node
const path = require('path');
const os = require("os");
const fs = require(`fs`);
const inquirer = require('inquirer')
const chalk = require('chalk');
const isUrlValid = require("./utils/isValidUrl")
const validateEmail = require("./utils/checkEmail")
require("dotenv").config();
const omsPath = path.join(os.homedir(), ".oms")

const axios = require("axios");


const createResults = async () => {
    const createURL = "http://localhost:8080/post";
    const questions = [
        {
            "message": "Enter Title: ",
            "type": "input",
            "name": "title"
        },
        {
            "message": "Conents for the Post: ",
            "type": "input",
            "name": "content"
        },
        {
            "message": "Tags: ",
            "type": "input",
            "name": "tags"
        },
    ]
    const answers = await inquirer.prompt(questions)
    // console.log(answers);
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

const login = async (email, api) => {

    let questions = [
        {
            type: 'password',
            message: 'Enter password: ',
            name: 'password',
            mask: true
        }
    ]

    const answers = await inquirer.prompt(questions);
    const data = {
        grant_type: 'password',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: api,
        username: email,
        password: answers['password'],
        header: "content-type: application/x-www-form-urlencoded",
    }

    await axios.post(`${process.env.AUTH0_DOMIN}/oauth/token`, data).then(res => {
        fs.writeFile(path.join(omsPath, "context.json"), JSON.stringify(res.data), function (err) {
            if (err) throw err;
            console.log(chalk.bold.blueBright(`Context saved in ${path.join(omsPath, "context.json")}`));
        });
    }).catch(err => {
        // console.log(err.response);
        if (err.response) {
            const { status, data } = err.response;
            if (status) {
                console.log(chalk.red(data.error));
                console.log(chalk.red(status + " " + data.error_description));
            }

        }
        console.log(chalk.red("Please check the URL or Email Address"));
    })


}

const argv = require('yargs/yargs')(process.argv.slice(2))
    .scriptName("oms")
    .usage('Usage:$0 <command> [options]')
    .command({
        command: "login",
        desc: "Login the User to OMS",
        builder: {
            username: {
                alias: 'u',
                demandOption: true
            },
            api_url: {
                alias: 'a',
                demandOption: true
            }
        },
        handler: async (argv) => {

            if (validateEmail(argv.username) && isUrlValid(argv.api_url)) {
                await login(argv.username, argv.api_url);
            }
            else
                console.log(chalk.red("There is/are some error/s in input. Please check them"))
        },
    })
    .command({
        command: "get",
        desc: "Get the Status",
        builder: {
            id: {
                alias: 'i',
                demandOption: false
            }
        },
        handler: async (argv) => {

            try {
                await getResults(argv.id);
            } catch (error) {
                if (error?.response?.status === 401)
                    console.log(chalk.red("Unauthorized Access. Login Again!!"))

                else if (error?.code === "ECONNREFUSED")
                    console.log(chalk.red("URL not Found"))
            }
            // } else {
            //     console.log(chalk.red("There is/are some error/s in input. Please check them"))
            // }

        },
    })
    .command({
        command: "create",
        desc: "Create POST Requests",
        handler: async () => {
            try {
                await createResults();
            } catch (error) {
                if (error?.response?.status === 401)
                    console.log(chalk.red("Unauthorized Access. Login Again!!"))
                else if (error?.code === "ECONNREFUSED")
                    console.log(chalk.red("URL not Found"))
            }
            // } else {
            //     console.log(chalk.red("Please check URL again!!!"));
            // }

        },
    })
    .help('h')
    .alias('h', 'help')
    .wrap(null)
    .argv;