#!/usr/bin/env node
const path = require('path');
const os = require("os");
const fs = require(`fs`);
const inquirer = require('inquirer')
const chalk = require('chalk');
const isUrlValid = require("./utils/isValidUrl")
const validateEmail = require("./utils/checkEmail")

const omsPath = path.join(os.homedir(), ".oms")

const axios = require("axios");


const createResults = async url => {
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
            console.log(chalk.yellowBright("Error reading file from disk: Please Login Again!"));
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const res = await axios.post(url, answers, { headers: { 'authorization': `Bearer ${data?.access_token}` } });
            console.log((res.data))
        } catch (err) {
            if (err?.response?.status === 401)
                console.log(chalk.redBright("401 Unauthorized Error"));
            else
                console.log(chalk.red("Error parsing JSON string:"));

        }
    });

}

const getResults = async url => {
    fs.readFile(path.join(omsPath, "context.json"), "utf8", async (err, jsonString) => {
        if (err) {
            console.log(chalk.yellowBright("Error reading file from disk: Please Login Again!"));
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const res = await axios.get(url, { headers: { 'authorization': `Bearer ${data?.access_token}` } });
            console.log(res.data)
        } catch (err) {
            if (err?.response?.status === 401)
                console.log(chalk.redBright("401 Unauthorized Error"));
            else if (err?.response?.status === 404)
                console.log(chalk.red("URL not found! Please input correct URL."))
            else
                console.log(chalk.red("Error parsing JSON string:"));

        }
    });
}

const login = async (u, a, d) => {
    let questions = [
        {
            type: 'input',
            name: 'client',
            message: "Client ID: "
        },
        {
            type: 'password',
            name: 'secret',
            message: "Client Secret ID: ",
            mask: true
        },
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
        client_id: answers['client'],
        client_secret: answers['secret'],
        audience: d,
        username: u,
        password: answers['password'],
        header: "content-type: application/x-www-form-urlencoded",
    }

    await axios.post(a, data).then(res => {
        fs.writeFile(path.join(omsPath, "context.json"), JSON.stringify(res.data), function (err) {
            if (err) throw err; console.log(chalk.bold.blueBright(`Context saved in ${path.join(omsPath, "context.json")}`));
        });
    }).catch(err => {
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
            auth_url: {
                alias: 'a',
                demandOption: true
            },
            audience_url: {
                alias: 'd',
                demandOption: true
            }
        },
        handler: async (argv) => {

            if (validateEmail(argv.username) && isUrlValid(argv.auth_url) && isUrlValid(argv.audience_url)) {
                await login(argv.u, argv.auth_url, argv.audience_url);
            }
            else
                console.log(chalk.red("There is/are some error/s in input. Please check them"))
        },
    })
    .command({
        command: "get",
        desc: "Get the Status",
        builder: {
            url: {
                alias: 'u',
                demandOption: true
            }
        },
        handler: async (argv) => {
            if (isUrlValid(argv?.url)) {
                try {
                    await getResults(argv?.url);
                } catch (error) {
                    if (error?.response?.status === 401)
                        console.log(chalk.red("Unauthorized Access. Login Again!!"))

                    else if (error?.code === "ECONNREFUSED")
                        console.log(chalk.red("URL not Found"))
                }
            } else {
                console.log(chalk.red("There is/are some error/s in input. Please check them"))
            }

        },
    })
    .command({
        command: "create",
        desc: "Create POST Requests",
        builder: {
            url: {
                alias: 'u',
                demandOption: true
            }
        },
        handler: async (argv) => {
            if (validateEmail(argv?.url)) {
                try {
                    await createResults(argv?.url);
                } catch (error) {
                    if (error?.response?.status === 401)
                        console.log(chalk.red("Unauthorized Access. Login Again!!"))
                    else if (error?.code === "ECONNREFUSED")
                        console.log(chalk.red("URL not Found"))
                }
            } else {
                console.log(chalk.red("Please check URL again!!!"));
            }

        },
    })
    .help('h')
    .alias('h', 'help')
    .wrap(null)
    .argv;