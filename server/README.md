# Btawaifi Trello-ToDo-App

> A Fullstack Application That Allows Custom Communication with Trello

## Quick Start

``` bash
# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Create a .env file and write the following (or edit environmental variables on the webhost)
Trello_Key= {your app key}
Trello_Token= {your generated token}
Trello_Board_ID= {your chosen Board id}

# Run the client & server with concurrently
npm run dev

# Run the Express server only
npm run server

# Run the React client only
npm run client

# Server runs on http://localhost:5000 and client on http://localhost:3000
```

## In case you don't have the required environmental variables

``` bash
# Navigate To
https://trello.com/app-key

# Store your Key then generate a token by clicking on Generate Token (store it also)

# Create a .env file and write the following (or edit environmental variables on the webhost)
Trello_Key= {your app key}
Trello_Token= {your generated token}

# Run the Express server to get your board id
npm run server
Navigate to '/boards' route in the browser url ex:"http://localhost:5000/boards"

# Store your board ID and add to .env file
Trello_Token= {your generated token}

# Continue by restarting the server and running the client
```
