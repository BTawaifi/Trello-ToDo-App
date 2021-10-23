const axios = require('axios').default

exports.getAllBoards = () => {
    return axios.get(`https://api.trello.com/1/members/me/boards?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}

exports.getLists = () => {
    return axios.get(`https://api.trello.com/1/boards/${process.env.Trello_Board_ID}/lists?fields=name&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}

exports.getCards = (listId) => {
    return axios.get(`https://api.trello.com/1/lists/${listId}/cards?fields=name,idList&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}

exports.addCard = (listId, name) => {
    return axios.post(`https://api.trello.com/1/cards?idList=${listId}&name=${name}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}

exports.moveCard = (cardId, t_listId) => {
    return axios.put(`https://api.trello.com/1/cards/${cardId}?idList=${t_listId}&key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}

exports.archiveAll = (listId) => {
    return axios.post(`https://api.trello.com/1/lists/${listId}/archiveAllCards?key=${process.env.Trello_Key}&token=${process.env.Trello_Token}`)
}