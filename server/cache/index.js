const redis = require('redis');
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);
client.on('error', function (err) {
    console.error("In Process " + process.pid + " " + err);
});

client.on('connect', function () {
    console.log("Process " + process.pid + " connected to redis");
});

// Cache middleware

async function getCacheValue(key) {
    if (client.ready) {
        client.get(key, (err, value) => {
            if (err) {
                console.log(err)
                throw err
            };
            if (value !== null) {
                return value;
            } else {
                console.log('nil')
                return null
            }
        });
    }
    else return null
}

exports.cacheMiddleware = (req, res, next) => {
    const key = req.route.path;
    if (client.ready) {
        client.get(key, (err, value) => {
            if (err) {
                throw err
            };
            if (value !== null) {
                res.send(JSON.parse(value));
            } else {
                next();
            }
        });
    }
    else next();
}

//cache
exports.handleNewCard = async (key, cardId, name, listID, chosenList) => {
    //converts the chosenList cards into an array, adds the new card
    try {
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    let myBoard = JSON.parse(value);
                    const entries = Object.values(myBoard[chosenList].cards); //array
                    const newCardObject = { "id": cardId, "name": name, "idList": listID }
                    entries.push(newCardObject)

                    //converts the array back into an object and replace chosenList cards with the new entries
                    myBoard[chosenList].cards = { ...entries }

                    client.SETEX(key, 20, JSON.stringify(myBoard));

                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }

}

exports.handleMoveCard = (key, oldID, from, to) => {
    try {
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    let myBoard = JSON.parse(value)
                    const FromList = Object.values(myBoard[from].cards); //array
                    const ToList = Object.values(myBoard[to].cards); //array

                    //remove objects from FromList adds it to ToList
                    let filteredEntries = [];
                    let targetObject;
                    FromList.forEach(item => {
                        //returns the FromList cards without the uneeded one (set the uneeded as target)
                        if (item.id !== oldID)
                            filteredEntries.push(item)
                        else
                            targetObject = item
                    })
                    ToList.push(targetObject)
                    //convert from array into object and insert back
                    myBoard[from].cards = { ...filteredEntries }
                    myBoard[to].cards = { ...ToList }
                    client.SETEX(key, 20, JSON.stringify(myBoard));
                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}

exports.handleBoardContents = async (key, value) => {
    client.SETEX(key, 40, JSON.stringify(value));
}

exports.handleArchiveAll = (key, listNum) => {
    try {
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    let myBoard = JSON.parse(value)
                    myBoard[listNum].cards = {}
                    client.SETEX(key, 20, JSON.stringify(myBoard));
                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}