const express = require("express");
const axios = require('axios').default
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
require('dotenv').config()

//edit .env file for preconfigured key, token and board id (or add them to webhost app)

//Multi Processor support for scaling
const os = require('os')
const cluster = require('cluster')


if (cluster.isMaster) {
    console.log(`Process ${process.pid} running`)
    const numCpus = os.cpus().length;
    console.log(`Forking ${numCpus} process`)
    for (let index = 0; index < numCpus; index++) {
        cluster.fork()
    }
    cluster.on('exit', (worker) => {
        console.error(`worker ${worker.pid} killed`)
        cluster.fork()
    })
}
else {

    client = redis.createClient(REDIS_PORT);
    client.on('error', function (err) {
        console.error("In Process " + process.pid + " " + err);
    });

    client.on('connect', function () {
        console.log("Process " + process.pid + " connected to redis");
    });

    // Cache middleware
    function cache(req, res, next) {
        try {
            const key = req.route.path;
            client.get(key, (err, value) => {
                if (err) throw err;
                if (value !== null) {
                    res.send(JSON.parse(value));
                } else {
                    next();
                }
            });
        } catch (err) {
            console.log(err.errno);
            next();
        }
    }

    //Modify Cors to allow or disallow Cross-origin resource sharing (whitelist the frontend)
    //Default allow requests from all origins
    const app = express();
    app.use(cors({
        origin: '*'
    }));

    //Security headers and compression
    app.use(helmet())
    app.use(compression())

    app.use(express.json())

    app.get('/', async (req, res) => {
        res.send("Server Online")
    })

    //Gets Lists and their cards within the board, concatinates them into one JSON response
    app.get('/boardcontents', cache, (req, res) => {
        axios.get(`https://api.trello.com/1/boards/${process.env.Trello_Board_ID}/lists?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then(async request => {
                let cardsArray = [];
                const lists = request.data;
                const updatePromises = [];

                //handles card fetching for each list (Async Mutex)
                for (let i = 0; i < lists.length; i++) {
                    updatePromises.push(
                        await axios.get(`https://api.trello.com/1/lists/${lists[i].id}/cards?fields=name,idList&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
                            .then(request => {
                                cardsArray = [...cardsArray, request.data];
                            })
                            .catch(err => res.send(err.errno))
                    );
                    await Promise.all(updatePromises);
                }
                //Synchronous code pushes cards into their lists
                let concater = []
                for (let i = 0; i < cardsArray.length; i++) {
                    cardsArray[i].forEach((sub) => {
                        concater.push(sub);
                    });

                    lists[i].cards = { ...concater }
                    concater = []
                }

                client.SETEX(req.route.path, 30, JSON.stringify(lists));

                res.json(lists)
            })
            .catch(err => res.send(err.errno));

    })

    //Create a new card
    app.post('/cards/new', async (req, res) => {
        if (req.body.name !== '')
            axios.post(`https://api.trello.com/1/cards?idList=${req.body.listid}&name=${req.body.name}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
                .then((response) => {
                    res.json(response.data.id)
                })
                .catch(err => res.send(err.errno));
        else res.status(400).send({
            status: 400,
            error: 'No Text'
        })
    })

    //Move a card from one list to another
    app.put('/cards::id', async (req, res) => {
        axios.put(`https://api.trello.com/1/cards/${req.params.id}?idList=${req.body.idList}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then((response) => {
                res.json(response.data)
            })
            .catch(err => res.send(err.errno));
    })

    //Archive all cards in a list
    app.post('/cards/archiveList', async (req, res) => {
        axios.post(`https://api.trello.com/1/lists/${req.body.listid}/archiveAllCards?key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then(() => {
                res.json(response.data)
            })
            .catch(err => res.send(err.errno));
    })

    //////////////////////////////
    /*   Not Used by Frontend   */

    app.get('/lists', async (req, res) => {
        axios.get(`https://api.trello.com/1/boards/${process.env.Trello_Board_ID}/lists?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then(request => {
                res.json(request.data)
            })
            .catch(err => res.send(err.errno));
    })

    //get cards for a specific list
    app.post('/cards', async (req, res) => {
        axios.get(`https://api.trello.com/1/lists/${req.body.listid}/cards?fields=name,idList&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then(request => {
                res.json(request.data)
            })
            .catch(err => res.send(err.errno));
    })

    //Gets boards, Finds the wanted board by name, Sends back it's id
    app.get('/boards', function (req, res) {
        console.log('getboard')
        axios.get(`https://api.trello.com/1/members/me/boards?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
            .then(request => {
                Trello_Board_Name = "TodoBoard" //can be specified elsewhere
                let Trello_Boards_Response = request.data;
                const Trello_Board_ID = process.env.Trello_Board_ID || Trello_Boards_Response.find(element => element.name === Trello_Board_Name).id
                res.json(Trello_Board_ID)
            })
            .catch(err => res.send(err.errno));
    })


    app.listen(PORT, () => {
        console.log(`${process.pid} listening on port ${PORT}`)
    });
}
