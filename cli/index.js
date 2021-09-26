#!/usr/bin/env node
const chalk = require('chalk');
const isUrlValid = require("./utils/validateURL")
const validateEmail = require("./utils/validateEmail")
const inquirer = require('inquirer');

require("dotenv").config();


const { createResults } = require("./commandUtils/omsCreate");
const { getResults } = require("./commandUtils/omsGet");
const { login } = require("./commandUtils/omsLogin");


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
            password: {
                alias: 'p',
                demandOption: true
            }
            ,
            api_url: {
                alias: 'a',
                demandOption: true
            }
        },
        handler: async (argv) => {

            if (validateEmail(argv.username) && isUrlValid(argv.api_url)) {
                await login(argv.username, argv.api_url, argv.password);
            }
            else
                console.log(chalk.red("Please check the Email Address you have entered"))
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
        },
    })
    .command({
        command: "create",
        desc: "Create POST Requests",
        handler: async () => {
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
            try {

                await createResults(answers);
            } catch (error) {
                if (error?.response?.status === 401)
                    console.log(chalk.red("Unauthorized Access. Login Again!!"))
                else if (error?.code === "ECONNREFUSED")
                    console.log(chalk.red("URL not Found"))
            }
        },
    })
    .help('h')
    .alias('h', 'help')
    .wrap(null)
    .argv;