import axios from 'axios';

export const getAllBoards = () => {
    return axios.get(`https://api.trello.com/1/members/me/boards?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};

export const getLists = () => {
    return axios.get(`https://api.trello.com/1/boards/${process.env.Trello_Board_ID}/lists?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};

export const getCards = (listId: string) => {
    return axios.get(`https://api.trello.com/1/lists/${listId}/cards?fields=name,idList&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};

export const addCard = (listId: string, name: string) => {
    return axios.post(`https://api.trello.com/1/cards?idList=${listId}&name=${name}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};

export const moveCard = (cardId: string, t_listId: string) => {
    return axios.put(`https://api.trello.com/1/cards/${cardId}?idList=${t_listId}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};

export const archiveAll = (listId: string) => {
    return axios.post(`https://api.trello.com/1/lists/${listId}/archiveAllCards?key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`);
};