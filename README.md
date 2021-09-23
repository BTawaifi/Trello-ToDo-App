# Btawaifi Trello-ToDo-App

> A Fullstack Application That Allows Custom Communication with Trello

## Quick Start

### In case you don't have the required enviromental variables

``` bash
# Navigate To
https://trello.com/app-key

# Store your Key then generate a token by clicking on Generate Token (store it also)

# Create a .env file and write the following (or edit enviromental variables on the webhost)
Trello_Key= {your app key}
Trello_Token= {your generated token}

# Run the Express server to get your board id
cd server
npm run server
Navigate to '/boards' route in the browser url ex:"http://localhost:5000/boards"

# Store your board ID and add to .env file
Trello_Token= {your generated token}

# Continue by restarting the server and running the client
```

### Redis Setup (If you want your requests to be cached)

NOTE: redis require custom configuration beside the basic config

#### On windows download and install

```bash
https://github.com/tporadowski/redis/releases
```

### Npm Setup

``` bash
# Change directory to server directory
cd server

# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Create a .env file and write the following (or add enviromental variables on the webhost)
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

# If the server is not on localhost add or edit .env on the client
GENERATE_SOURCEMAP=FALSE
REACT_APP_Server_URL="http://localhost:5000"

```


### Docker Setup

``` bash
# Edit docker-compose.yml with your own enviromental variables
Trello_Key= {your app key}
Trello_Token= {your generated token}
Trello_Board_ID= {your chosen Board id}

# Run the Following Commands
docker build -t "react-app" ./client/
docker build -t "api-server" ./server/

# Start The Containers

docker-compose up

# To Stop The Containers

docker-compose down

# Server runs locally on http://localhost:5000 and client on http://localhost:3000
```

