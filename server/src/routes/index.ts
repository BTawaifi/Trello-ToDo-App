import express from 'express';
const router = express.Router();
import { getAllBoards, getLists, getCards, addCard, moveCard, archiveAll } from "./functions"; //axios functions
import { cacheTest, cacheMiddleware, cacheBoardContents, cacheNewCard, cacheMoveCard, cacheArchiveAll } from "../cache"; //redis caching
import { TrelloCard, TrelloList } from '../interfaces/general';

router.get('/', async (_req:express.Request, res: express.Response) => {
    res.send("Server Online");
});

router.get('/cacheTest', (_req:express.Request, res: express.Response) => {
    cacheTest("test", "Testing", (value: string) => {
        console.log(value +" Done");
        res.send(value +" Done");
    });
});

//Gets Lists and their cards within the board, concatinates them into one JSON response
//cacheMiddleware works if the redis server is online
router.get('/boardcontents', cacheMiddleware, (req:express.Request, res: express.Response) => {
    //console.log('/boardcontents Called');
    getLists()
        .then(async request => {
            let cardsArray: Array<TrelloCard> = [];
            const lists:Array<TrelloList> = request.data;
            const updatePromises = [];

            //handles card fetching for each list (Async Mutex)
            for (let i = 0; i < lists.length; i++) {
                updatePromises.push(
                    await getCards(lists[i].id).then(request => {
                        cardsArray = [...cardsArray, request.data];
                    })
                        .catch(err => res.send(err.errno))
                );
                await Promise.all(updatePromises);
            }

            //Synchronous code pushes cards into their lists
            let concater: TrelloCard[] = [];
            for (let i = 0; i < cardsArray.length; i++) {
                (cardsArray[i] as unknown as TrelloCard[]).forEach((sub: TrelloCard) => {
                    concater.push(sub);
                });

                lists[i].cards = { ...concater };
                concater = [];
            }

            await cacheBoardContents(req.route.path, lists);
            res.json(lists);
        })
        .catch(err => res.send(err));
});


//Create a new card
router.post('/cards/new', async (req:express.Request, res: express.Response) => {
    if (req.body.name !== '')
        addCard(req.body.listid, req.body.name).then(response => {
            cacheNewCard("/boardcontents", response.data.id, req.body.name, req.body.listid, 0);
            res.json(response.data.id);
        })
            .catch(err => res.send(err));
    else res.status(400).send({
        status: 400,
        error: 'No Text'
    });
});

//Move a card from one list to another
router.put('/cards::id', async (req:express.Request, res: express.Response) => {
    moveCard(req.params.id, req.body.idList).then(response => {
        cacheMoveCard("/boardcontents", req.params.id, 0, 1);
        res.json(response.data);
    })
        .catch(err => res.send(err));
});

//Archive all cards in a list
router.post('/cards/archiveList', async (req:express.Request, res: express.Response) => {
    archiveAll(req.body.listid)
        .then(response => {
            cacheArchiveAll("/boardcontents", 1);
            res.json(response.data);
        })
        .catch(err => res.send(err));
});

router.get('/lists', async (_req:express.Request, res: express.Response) => {
    getLists()
        .then(request => {
            res.json(request.data);
        })
        .catch(err => res.send(err));
});

//get cards for a specific list
router.post('/cards', async (req:express.Request, res: express.Response) => {
    getCards(req.body.listid)
        .then(request => {
            res.json(request.data);
        })
        .catch(err => res.send(err));
});

//Gets boards, Finds the wanted board by name, Sends back it's id
router.get('/boards', (_req:express.Request, res: express.Response) => {
    getAllBoards().then(request => {
        const Trello_Board_Name = "TodoBoard"; //can be specified elsewhere
        const Trello_Boards_Response = request.data;
        const Trello_Board_ID = process.env.Trello_Board_ID || Trello_Boards_Response.find((element: { name: string; }) => element.name === Trello_Board_Name).id;
        res.json(Trello_Board_ID);
    })
        .catch(err => res.send(err));
});

export default router;