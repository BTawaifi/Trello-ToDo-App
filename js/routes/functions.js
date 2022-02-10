"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveAll = exports.moveCard = exports.addCard = exports.getCards = exports.getLists = exports.getAllBoards = void 0;
const axios_1 = __importDefault(require("axios"));
const getAllBoards = () => {
    return axios_1.default.get(`https://api.trello.com/1/members/me/boards?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.getAllBoards = getAllBoards;
const getLists = () => {
    return axios_1.default.get(`https://api.trello.com/1/boards/${process.env.Trello_Board_ID}/lists?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.getLists = getLists;
const getCards = (listId) => {
    return axios_1.default.get(`https://api.trello.com/1/lists/${listId}/cards?fields=name,idList&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.getCards = getCards;
const addCard = (listId, name) => {
    return axios_1.default.post(`https://api.trello.com/1/cards?idList=${listId}&name=${name}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.addCard = addCard;
const moveCard = (cardId, t_listId) => {
    return axios_1.default.put(`https://api.trello.com/1/cards/${cardId}?idList=${t_listId}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.moveCard = moveCard;
const archiveAll = (listId) => {
    return axios_1.default.post(`https://api.trello.com/1/lists/${listId}/archiveAllCards?key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};
exports.archiveAll = archiveAll;
