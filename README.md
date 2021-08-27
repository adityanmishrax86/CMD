## Setup

## Minimum Requirements
- NodeJS 12.0 or above

### Steps for Mock Server Setup
- Select an Application Type of Regular Web Apps.
- Add an Allowed Callback URL of http://localhost:PORT/callback.
- Make sure your Application's Grant Types include Password. To learn how, read [Update Grant Types](https://auth0.com/docs/applications/update-grant-types).
- Copy client ID, Client Secret and Domain
- Go to Dashboard > Applications > APIs, and select + Create API or [follow here](https://auth0.com/docs/get-started/set-up-apis).
- Go to [User's tenants settings](https://manage.auth0.com/#/tenant) and then go to Default Directory and add `Username-Password-Authentication` there.
- Now inside the Server folder create an `.env` file and add following environment variables



|Variables|values|
|---|---|
|AUTH0_SECRET|   |
|AUTH0_BASE_URL|   |
|AUTH0_CLIENT_ID|   |
|AUTH0_ISSUER_BASE_URL|   |
|JWT_JWKS_URI|   |
|JWT_AUDIENCE|   |
|JWT_ISSUER|   |
|PORT|   |

- Then run `npm install` for setup all required packages to run the server.

- Then run `npm start` and the server will be running at the specified `PORT`.

- Create a new User by going to `http://localhost:PORT/login`

- Once successfully user created and logged in you will be redirected to `http://localhost:PORT` with Logged in written on the screen

### CLI setup

- go to the cli directory
- Run `npm install` and install all the dependencies for the tool.
- Now run `npm link` to create executable command from the terminal/command prompt globally.
### Running The Tool
- now run `oms --help` it will show you all the available commands to run and get the results.

# oms login
- This command will ask username, auth_url and audience_url as input
 `oms login -u 'someone@exam.com' -a 'AUTH0_DOMAIN\outh\token -au 'Audience URL from the API'`

- then it will ask for client id, client secret and password for the user. After succesfull login the context will saved to user's Home directory as json file named `context.json`

# oms get
- this command will send GET request to all the GET routes of the API. and will return the json response from the API.
- command `oms get -u "api url"`

# oms create
- this command will POST a record to the API and will return response in JSON format.

- It will ask interactively to input data and then it will convert it to json and send POST request to the API.

- command - `oms create -u "API Url"`

## API
- `/status` - **GET** - returns "Success"
- `/login` - **GET** - login or create an user in UI
- `/logout` - **GET** - logs out the user in UI
- `/posts` - **GET** - returns all the posts
- `/posts/:id` - **GET** - returns the post of having __id__
- `/post` - **POST** - Create a record
