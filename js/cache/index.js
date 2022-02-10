"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheTest = exports.cacheArchiveAll = exports.cacheMoveCard = exports.cacheNewCard = exports.cacheBoardContents = exports.cacheMiddleware = exports.redis = exports.redis_config = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379 || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1' || 'localhost';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
exports.redis_config = {
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
};
exports.redis = new ioredis_1.default(exports.redis_config);
const cacheMiddleware = async (req, res, next) => {
    const key = req.route.path;
    try {
        await exports.redis.get(key, (err, value) => {
            if (err) {
                throw err;
            }
            if (value !== null) {
                res.send(JSON.parse(value));
            }
            else {
                next();
            }
        });
    }
    catch (error) {
        next();
    }
};
exports.cacheMiddleware = cacheMiddleware;
const cacheBoardContents = async (key, value) => {
    exports.redis.setex(key, 60, JSON.stringify(value));
};
exports.cacheBoardContents = cacheBoardContents;
const cacheNewCard = async (key, cardId, name, listID, chosenList) => {
    try {
        await exports.redis.get(key, (err, value) => {
            if (err)
                throw err;
            if (value) {
                const myBoard = JSON.parse(value);
                const entries = Object.values(myBoard[chosenList].cards);
                const newCardObject = { "id": cardId, "name": name, "idList": listID };
                entries.push(newCardObject);
                myBoard[chosenList].cards = { ...entries };
                exports.redis.setex(key, 60, JSON.stringify(myBoard));
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.cacheNewCard = cacheNewCard;
const cacheMoveCard = async (key, oldID, from, to) => {
    try {
        await exports.redis.get(key, (err, value) => {
            if (err)
                throw err;
            if (value) {
                const myBoard = JSON.parse(value);
                const FromList = Object.values(myBoard[from].cards);
                const ToList = Object.values(myBoard[to].cards);
                const filteredEntries = [];
                let targetObject;
                FromList.forEach((item) => {
                    if (item.id !== oldID)
                        filteredEntries.push(item);
                    else
                        targetObject = item;
                });
                ToList.push(targetObject);
                myBoard[from].cards = { ...filteredEntries };
                myBoard[to].cards = { ...ToList };
                exports.redis.setex(key, 60, JSON.stringify(myBoard));
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.cacheMoveCard = cacheMoveCard;
const cacheArchiveAll = async (key, listNum) => {
    try {
        await exports.redis.get(key, (err, value) => {
            if (err)
                throw err;
            if (value) {
                const myBoard = JSON.parse(value);
                myBoard[listNum].cards = {};
                exports.redis.setex(key, 60, JSON.stringify(myBoard));
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.cacheArchiveAll = cacheArchiveAll;
const cacheTest = async (key, testValue, callback) => {
    try {
        await exports.redis.set(key, testValue);
        await exports.redis.get(key, (err, value) => {
            if (err)
                throw err;
            if (value) {
                callback(value);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.cacheTest = cacheTest;
