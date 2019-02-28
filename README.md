## The web as an application platform - 1DV527

### By Johan Söderlund

# SmartHome
Homepage/entrypoint of [Smart home](https://13.53.201.101/smarthome).

Register your smart home to this API and use the CRUD functionality to control your home from anywhere.

Supported appliances:
* light bulbs
* doors
* windows
* cars
* computers

## Questions

**1. How have you implemented the idea of HATEOAS in your API? Motivate your choices and how it support the idea of HATEOAS.**

My API have one entry point, ( https://13.53.201.101/smarthome/ ), and use HATEOAS for making the API browseable. The response body consists of a object called links which contains available links, for example a GET to /smarthome/homes gives the links part of the response like follows: 

"links": {
"home": "/",
"login": "/login",
"register": "/register",
"_self": "/homes",
"home": "/homes/:id",
"Lars apartment34": "/homes/5c66a9a43a46f306a3c3442c"
}

Since the API is small every link available for the specific user is delivered in one response.

_self contains the actual state, in this case the response came from /homes.

[HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) according to Wikipedia the goal is to facilitate for the client to use the API. I chose to do so by always returning the state of the application and also every other possible navigation.

**2. If your solution should implement multiple representations of the resources. How would you do it?**

I would start with offering application/xml and use content negotiation to decide which to send. But by default send json format.

**3. Motivate and defend your authentication solution? Why did you choose the one you did? Pros/Cons.**

To use the application one needs to register a user with a username and password, (which i hash with a salt). Upon registering an access_token is delivered to the client and also stored in the user-document database. The token can then be used to access resources private to the user. The token must come through the Bearer header and it is a JWT that can be verified by my server only. It is valid for 62 days but this will be changed in a later version to be valid a shorter time and a refresh_token will then be used to create a new access_token. 

I decided to work with 'koa-jwt', 'koa-jwt-decode' and 'jsonwebtoken' libraries. Validation of the token is done by using 'koa-jwt' and 'koa-jwt-decode' as middleware in relevant routes. '/', 'register' and '/login' are public resources.

A pro using jwt is that the token itself cannot be manipulated so as long as the client use it with care I will know that the request comes from the correct user.

A con with handling to whole authentication flow, not using frameworks like passport and "outsourcing" user handling to google- and Facebook-accounts etc is that their are more potenial points of failure and security misses when you have to do everything yourself. A pro with this strategy is that you don't have to rely on users having accounts on other platforms.

**4. Explain how your web hook works.**

Upon registration a user can chose to register a web-hook callback URL to get data when a new home-resource is created. The callback is stored to the user-model in the database and when a new home-resource is POSTED to my server the route will trigger a postToWebhook middleware which uses 'axios' library to send a POST to the users URL containing the new home-resource in json format.

**5. Since this is your first own web API there are probably things you would solve in an other way looking back at this assignment. Write your thoughts down.**

I would separate some business logic from the router and database manager into separate components to get cleaner API-routing- and database-code.

# Documentation

The database is already populated with two users Lars and Liza with homes. If you want to use all the requests in the POSTMAN collection. Follow the instructions under /drop. Otherwise, every other request but register and POST /homes will work without changing the data in the bodies.

**Webhook [callback url](https://webhook.site/#/898fbdcd-b9b3-476a-b8bd-74ca4f3dad26/8d0fee74-4bfa-4d89-a491-058cd9bc9133/1) for users**

**To use this API prefix every request with _https://13.53.201.101/smarthome/_**

Content-Type: application/json

### **/**

Available methods: GET and HEAD.

**Response**

Status: 200 OK

links: {_self: "/", login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"}

### **/drop**

Use with care! Will drop user and home collection! Is used to reset the database for testing purposes. If you need to recreate users ONLY. This will get the side effect that old tokens will not be valid for POSTMAN collection, for the newly created users you have to copy the token and update the POSTMAN environment variables. Same goes for POSTMAN methods to newly created homes with links /homes/:id, were :id needs to be updated. To do this use method GET /homes to retrieve the ids under links object in the body response.

### **/register**

Register a new user. 

Available methods: POST and HEAD.

Request with body:
{
"user": "example user",
"password": "examplePassword",
"webhookCallback": "https://webhook.site/898fbdcd-b9b3-476a-b8bd-74ca4f3dad26"
}

**Response**

Status: 201 Created

links = {home: "/", login: "/login", _self: "/register", homes: "/homes", home: "/homes/:id"};

### **/login**

Login to the application to receive a token.

Available methods: POST and HEAD.

Request with Body:

{
"user": "Lars",
"password": "asdqwe123"
}

**Response**

Status: 200 OK.

{
"links": {
"login": "/login",
"register": "/register",
"homes": "/homes",
"home": "/homes/:id"
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiTGFycyIsImlhdCI6MTU1MDIzMTkzMSwiZXhwIjoxNTU1NTg4NzMxfQ.yfSqwJTONoVAOriW2JeEhtTAsbWppy-6CJEl2xHYVd0"
}

### **/homes**

Get all your smart-homes. Create a smart-home. Delete ALL smart-homes.

Available methods: GET, POST, DELETE and HEAD.

If POST request with body:

{
"user": "Lars",
"name": "Lars apartment34",
"lightbulbs": [
{
"lightbulbName": "garage", "on": true, "runTime": 100, "lifeTime": 1021300, "watt": 400
},
{
"lightbulbName": "garage2", "on": false, "runTime": 21230, "lifeTime": 1134000, "watt": 30
}
],
"doors": [
{
"doorName": "frontDoor", "open": false, "locked": true
},
{
"doorName": "balconyDoor", "open": false, "locked": true
}
],
"windows": [
{
"windowName": "officeWindow", "open": true, "locked": false
},
{
"windowName": "bedroomWindow", "open": false, "locked": true
}
],
"cars": [
{
"carName": "Tesla model X", "locked": true, "battery": 40, "location": "Latitude: 39.4044829, Longitude: 57.9804469"
}
],
"computers": [
{
"computerName": "HP pavillion", "on": true, "battery": false, "purpose": "streaming"
},
{
"computerName": "Macbook air", "on": false, "battery": 77, "purpose": "blogging"
}
]
}

**Response from POST**

Status: 201 Created.

{
"links": {
"login": "/login",
"register": "/register",
"homes": "/homes",
"home": "/homes/:id",
"_self": "/homes"
},
homes: {
"user": "Lars",
"name": "Lars apartment34",
"lightbulbs": [
{
"lightbulbName": "garage", "on": true, "runTime": 100, "lifeTime": 1021300, "watt": 400
},
{
"lightbulbName": "garage2", "on": false, "runTime": 21230, "lifeTime": 1134000, "watt": 30
}
],
"doors": [
{
"doorName": "frontDoor", "open": false, "locked": true
},
{
"doorName": "balconyDoor", "open": false, "locked": true
}
],
"windows": [
{
"windowName": "officeWindow", "open": true, "locked": false
},
{
"windowName": "bedroomWindow", "open": false, "locked": true
}
],
"cars": [
{
"carName": "Tesla model X", "locked": true, "battery": 40, "location": "Latitude: 39.4044829, Longitude: 57.9804469"
}
],
"computers": [
{
"computerName": "HP pavillion", "on": true, "battery": false, "purpose": "streaming"
},
{
"computerName": "Macbook air", "on": false, "battery": 77, "purpose": "blogging"
}
]
}
}

**Response from GET**

Status: 200 OK.

{
"links": {
"login": "/login",
"register": "/register",
"homes": "/homes",
"home": "/homes/:id",
"_self": "/homes"
},
homes: {
"user": "Lars",
"name": "Lars apartment34",
"lightbulbs": [
{
"lightbulbName": "garage", "on": true, "runTime": 100, "lifeTime": 1021300, "watt": 400
},
{
"lightbulbName": "garage2", "on": false, "runTime": 21230, "lifeTime": 1134000, "watt": 30
}
],
"doors": [
{
"doorName": "frontDoor", "open": false, "locked": true
},
{
"doorName": "balconyDoor", "open": false, "locked": true
}
],
"windows": [
{
"windowName": "officeWindow", "open": true, "locked": false
},
{
"windowName": "bedroomWindow", "open": false, "locked": true
}
],
"cars": [
{
"carName": "Tesla model X", "locked": true, "battery": 40, "location": "Latitude: 39.4044829, Longitude: 57.9804469"
}
],
"computers": [
{
"computerName": "HP pavillion", "on": true, "battery": false, "purpose": "streaming"
},
{
"computerName": "Macbook air", "on": false, "battery": 77, "purpose": "blogging"
}
]
}
}

### **/homes/:id**

Get all your smart-homes. Create smart-home. Delete smart-home.

Available methods: GET, PUT, POST, PATCH, DELETE and HEAD.

PUT completely updates a home with the new data, thus removing existing data that is not in the body of the request. PATCH adds the data from the body to the home thus existing data that is not updated by the patch remains.
POST creates a new home, if one already exists response is 400 Bad Request: {
"value": "Home already exist",
"success": false
}

If PUT, POST or PATCH request with body:

{
"user": "Lars",
"name": "Lars apartment34",
"lightbulbs": [
{
"lightbulbName": "garage", "on": true, "runTime": 100, "lifeTime": 1021300, "watt": 400
},
{
"lightbulbName": "garage2", "on": false, "runTime": 21230, "lifeTime": 1134000, "watt": 30
}
]
}

**Response from GET**

Status: 200 OK.

{
links = 
{ home: "/", login: "/login", register: "/register", homes: "/homes", home: "/homes/:id", _self:"/homes/:id"},
homes: {
"lightbulbs": [
{
"lightbulbName": "garage", "on": true, "runTime": 100, "lifeTime": 1021300, "watt": 400
},
{
"lightbulbName": "garage2", "on": false, "runTime": 21230, "lifeTime": 1134000, "watt": 30
}
],
}
}
