import Redis from 'ioredis';
import express from 'express';
const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379 || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1' || 'localhost';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
//if you are using docker set REDIS_HOST to the name of the redis container 
//if you are using docker in windows set WSL adapter IP to DHCP

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

export const redis_config = {
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
};

export const redis = new Redis(redis_config);

/* client.on('error', err => {
    console.error("In Process " + process.pid + " " + err);
});

client.on('connect', () => {
    console.log("Process " + process.pid + " connected to redis");
}); */

// Cache middleware, serves cache in case of hit
export const cacheMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.route.path;
    try {
        await redis.get(key, (err, value) => {
            if (err) {
                throw err;
            }
            if (value !== null) {
                res.send(JSON.parse(value));
            } else {
                next();
            }
        });
    } catch (error) {
        next();
    }

};


//In Cache Writers, Used By Routes Module (accessed Externally)
//You Can Change Expiration time of the Key-Value pair individually

//Creates The main dataset that other caching operations are utilizing
export const cacheBoardContents = async (key: Redis.KeyType, value: any) => {
    redis.setex(key, 60, JSON.stringify(value));
};

export const cacheNewCard = async (key: Redis.KeyType, cardId: string, name: string, listID: string, chosenList: number) => {
    try { //checks if the cache server is online
        await redis.get(key, (err, value) => {
            if (err) throw err;
            if (value) {
                //Adds new object to the primary dataset
                const myBoard = JSON.parse(value);
                const entries = Object.values(myBoard[chosenList].cards); //array
                const newCardObject = { "id": cardId, "name": name, "idList": listID };
                entries.push(newCardObject);

                //converts the array back into an object and replace chosenList cards with the new entries
                myBoard[chosenList].cards = { ...entries };

                redis.setex(key, 60, JSON.stringify(myBoard)); //rewrite changes on the primary db
            }
        });
    }
    catch (err) {
        console.log(err);
    }

};

export const cacheMoveCard = async (key: Redis.KeyType, oldID: string, from: number, to: number) => {
    try {
        await redis.get(key, (err, value) => {
            if (err) throw err;
            if (value) {
                //Gets primary dataset
                const myBoard = JSON.parse(value);
                const FromList = Object.values(myBoard[from].cards); //array
                const ToList = Object.values(myBoard[to].cards); //array

                //remove objects from FromList adds it to ToList
                const filteredEntries: any[] = [];
                let targetObject;
                FromList.forEach((item: any) => {
                    //returns the FromList cards without the uneeded one (set the uneeded as target)
                    if (item.id !== oldID)
                        filteredEntries.push(item);
                    else
                        targetObject = item;
                });
                ToList.push(targetObject);
                //convert from array into object and insert back
                myBoard[from].cards = { ...filteredEntries };
                myBoard[to].cards = { ...ToList };

                //Update Primary Dataset
                redis.setex(key, 60, JSON.stringify(myBoard));
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};

export const cacheArchiveAll = async (key: Redis.KeyType, listNum: number) => {
    try {
        await redis.get(key, (err, value) => {
            if (err) throw err;
            if (value) {
                const myBoard = JSON.parse(value);
                myBoard[listNum].cards = {};
                redis.setex(key, 60, JSON.stringify(myBoard));
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};

export const cacheTest = async (key: string, testValue: string, callback: { (value: string): void; (arg0: any): void; }) => {
    try {
        await redis.set(key, testValue);
        await redis.get(key, (err: any, value: any) => {
            if (err) throw err;
            if (value) {
                callback(value);
                //async functions needs callback, 'return' will stop the function
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};