const redis = require('redis');
const REDIS_PORT = process.env.REDIS_PORT || 6379;

//Redis server is used here to provide in memory Key-Value data store caching
//We Aim To minimize the number of GET requests done on DB, while keeping the write requests the same
//The frequent GET requests from the clients are served by the cache (Allows Multi User Consistancy)
//In case of cache server failure the server serves GET requests directly from DB to the client (Needs Frequency Configuration)
//Implementing Time Based Expiry for keeping the server and DB in sync

/* 
    basic work: On Cache Miss executes /boardcontents (3 or more fetches combined into one JSON) 
    take the result store it in cache (with Expiration time) (PRIMARY Dataset)
    any basic operation will make a write request to the DB
    on response success from DB
    we GET the PRIMARY Dataset from cache and we do object and array operations on it 
    then resend it back to the cache (saves on GET requests to DB)

    *multi user writing can in some cases make the cache unsynced with the database 
    *due to object and array operations on one Primary Dataset (MUTEX)
    *solving mutex issues requires further investigation
    *Time Based Expiry for Primary Dataset resyncs the cache with the DB
*/

const client = redis.createClient(REDIS_PORT);
client.on('error', function (err) {
    console.error("In Process " + process.pid + " " + err);
});

client.on('connect', function () {
    console.log("Process " + process.pid + " connected to redis");
});

// Cache middleware, serves cache in case of hit

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


//In Cache Writers, Used By Routes Module (accessed Externally)
//You Can Change Expiration time of the Key-Value pair individually

//Creates The main dataset that other caching operations are utilizing
exports.cacheBoardContents = async (key, value) => {
    client.SETEX(key, 60, JSON.stringify(value));
}

exports.cacheNewCard = async (key, cardId, name, listID, chosenList) => {
    try { //checks if the cache server is online
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    //Adds new object to the primary dataset
                    let myBoard = JSON.parse(value);
                    const entries = Object.values(myBoard[chosenList].cards); //array
                    const newCardObject = { "id": cardId, "name": name, "idList": listID }
                    entries.push(newCardObject)

                    //converts the array back into an object and replace chosenList cards with the new entries
                    myBoard[chosenList].cards = { ...entries }

                    client.SETEX(key, 60, JSON.stringify(myBoard)); //rewrite changes on the primary db
                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }

}

exports.cacheMoveCard = (key, oldID, from, to) => {
    try {
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    //Gets primary dataset
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

                    //Update Primary Dataset
                    client.SETEX(key, 60, JSON.stringify(myBoard));
                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}

exports.cacheArchiveAll = (key, listNum) => {
    try {
        if (client.ready) {
            client.get(key, (err, value) => {
                if (err) throw err
                if (value) {
                    let myBoard = JSON.parse(value)
                    myBoard[listNum].cards = {}
                    client.SETEX(key, 60, JSON.stringify(myBoard));
                }
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}