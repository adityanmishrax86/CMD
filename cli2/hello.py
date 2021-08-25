import json
import click
from click.types import Path
import requests
from InquirerPy import prompt
from pathlib import Path
from json import JSONDecodeError
import re


token = ""
home_path = Path.home()

posts = {
    "title": "",
    "content": "",
    "tags": ""
}


def check_url(url):
    return re.search("^http(s)?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$", url)


def check_email(email):
    return re.search("^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", email)


def check_json(json):
    try:
        json_object = json.loads(json)
    except ValueError as e:
        return False
    return True


def get_authentication_token():
    with open(f"{home_path}/context.json") as r:
        return json.load(r)


@click.group()
def cli():
    pass


@cli.command()
@click.option('-n', '--name', type=str, help='Name to greet', default='World')
def hello(name):
    click.echo(f'Hello {name}')


@cli.command()
@click.option('-u', '--username', type=str, help='Username to Authenticate', required=True)
@click.option('-p', '--password', type=str, help='password for the User to Authenticate', default="")
@click.option('-a', '--auth_url', type=str, help='Authentication URL', required=True)
def login(username, password, auth_url):

    if not check_email(username):
        click.echo("Please Enter Correct Email Address")
        return

    if not check_url(auth_url):
        click.echo("Please enter Correct Authentication URL")
        return

    questions = [
        {
            "message": "Enter Client ID: ",
            "type": "input",
        },
        {
            "message": "Enter Client Secret: ",
            "type": "password",
        },
        {
            "message": "Password: ",
            "type": "password",
            "transformer": lambda _: "[hidden]"
        },
    ]
    input_results = prompt(questions)
    data = {
        "grant_type": 'password',
        "client_id": input_results[0],
        "client_secret": input_results[1],
        "audience": "http://localhost:8080/status",
        "header": "content-type: application/x-www-form-urlencoded",
        "username": username,
        "scope": "read:sample",
        "password": input_results[2]
    }

    try:
        pass
    except Exception as e:
        pass

    result_from_server = requests.post(auth_url, data=data)
    res_t = result_from_server.json()

    if "error" in res_t:
        click.echo(f"{res_t['error_description']}")
        click.echo(f"{res_t['error']}")
    else:
        with open(f"{home_path}/context.json", 'w', encoding='utf-8') as f:
            json.dump(res_t, f, ensure_ascii=False)
        click.echo(f"Context saved in {home_path}/context.json")


@cli.command()
@click.option('-u', '--url', type=str, help='URL to get Results', required=True)
def get(url):
    x = check_url(url)
    if not x:
        click.echo("Please check the URL!")
        return
    headers = {}

    try:
        token_data = get_authentication_token()
        headers = {"authorization": f"Bearer {token_data['access_token']}"}
        res = requests.get(url, headers=headers)
        if res.status_code == 401:
            click.echo("Access not Authorized, Login Again!!")
            return
        click.echo(json.dumps(res.text))

    except JSONDecodeError as e:
        click.echo(
            "There are some error while saving context, Relogin to fix the Issue!")
    except OSError as e:
        click.echo(
            "Context file not found, Relogin to fix the Issue!")
    except KeyError as e:
        click.echo("User is not Authenticated! Re-Login with Correct Credentials")
    except Exception as e:
        click.echo("Can't connect to Server!!")
        click.echo(e.__str__)


@cli.command()
@click.option('-u', '--url', type=str, help='URL to get Results', required=True)
# @click.option('-d', '--data', type=str, help='URL to get Results', required=True)
def create(url):
    # if not check_url(url):
    #     click.echo("URL is not valid.")
    #     return

    # if not check_json(data):
    #     click.echo("Data is not correct Format")
    #     return

    try:
        questions = [
            {
                "message": "Enter Title: ",
                "type": "input",
            },
            {
                "message": "Conents for the Post: ",
                "type": "input",
            },
            {
                "message": "Tags: ",
                "type": "input",
            },
        ]
        input_results = prompt(questions)
        posts["title"] = input_results[0]
        posts["content"] = input_results[1]
        posts["tags"] = input_results[2]
        data = json.dumps(posts)
        token_data = get_authentication_token()
        headers = {"authorization": f"Bearer {token_data['access_token']}"}
        res = requests.post(url, data=posts, headers=headers)
        print(data)
        click.echo(res.text)
    except Exception as e:
        pass
