"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const functions_1 = require("./functions");
const cache_1 = require("../cache");
router.get('/', async (_req, res) => {
    res.send("Server Online");
});
router.get('/cacheTest', (_req, res) => {
    (0, cache_1.cacheTest)("test", "Testing", (value) => {
        console.log(value + " Done");
        res.send(value + " Done");
    });
});
router.get('/boardcontents', (req, res) => {
    (0, functions_1.getLists)()
        .then(async (request) => {
        let cardsArray = [];
        const lists = request.data;
        const updatePromises = [];
        for (let i = 0; i < lists.length; i++) {
            updatePromises.push(await (0, functions_1.getCards)(lists[i].id).then(request => {
                cardsArray = [...cardsArray, request.data];
            })
                .catch(err => res.send(err.errno)));
            await Promise.all(updatePromises);
        }
        let concater = [];
        for (let i = 0; i < cardsArray.length; i++) {
            cardsArray[i].forEach((sub) => {
                concater.push(sub);
            });
            lists[i].cards = { ...concater };
            concater = [];
        }
        await (0, cache_1.cacheBoardContents)(req.route.path, lists);
        res.json(lists);
    })
        .catch(err => res.send(err));
});
router.post('/cards/new', async (req, res) => {
    if (req.body.name !== '')
        (0, functions_1.addCard)(req.body.listid, req.body.name).then(response => {
            (0, cache_1.cacheNewCard)("/boardcontents", response.data.id, req.body.name, req.body.listid, 0);
            res.json(response.data.id);
        })
            .catch(err => res.send(err));
    else
        res.status(400).send({
            status: 400,
            error: 'No Text'
        });
});
router.put('/cards::id', async (req, res) => {
    (0, functions_1.moveCard)(req.params.id, req.body.idList).then(response => {
        (0, cache_1.cacheMoveCard)("/boardcontents", req.params.id, 0, 1);
        res.json(response.data);
    })
        .catch(err => res.send(err));
});
router.post('/cards/archiveList', async (req, res) => {
    (0, functions_1.archiveAll)(req.body.listid)
        .then(response => {
        (0, cache_1.cacheArchiveAll)("/boardcontents", 1);
        res.json(response.data);
    })
        .catch(err => res.send(err));
});
router.get('/lists', async (_req, res) => {
    (0, functions_1.getLists)()
        .then(request => {
        res.json(request.data);
    })
        .catch(err => res.send(err));
});
router.post('/cards', async (req, res) => {
    (0, functions_1.getCards)(req.body.listid)
        .then(request => {
        res.json(request.data);
    })
        .catch(err => res.send(err));
});
router.get('/boards', (_req, res) => {
    (0, functions_1.getAllBoards)().then(request => {
        const Trello_Board_Name = "TodoBoard";
        const Trello_Boards_Response = request.data;
        const Trello_Board_ID = process.env.Trello_Board_ID || Trello_Boards_Response.find((element) => element.name === Trello_Board_Name).id;
        res.json(Trello_Board_ID);
    })
        .catch(err => res.send(err));
});
exports.default = router;
