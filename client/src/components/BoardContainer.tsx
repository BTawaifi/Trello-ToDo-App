import React from "react";
import axios from "axios";
import ListItem from "./ListItem";
import { Spinner, Alert, Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { TrelloBoard, TrelloList } from "../interfaces/general";

interface props {
  serverURL: string;
}

const BoardContainer = ({ serverURL }: props) => {
  //The state that contains the lists and their cards
  const [Board, setBoard] = React.useState<TrelloBoard[] | null>(null);

  //handles fetching the board
  const [boardLoaded, setboardLoaded] = React.useState(false);

  //handles the button text for adding a new card
  const [isLoading, setLoading] = React.useState(false);

  //handles the input box for adding a new card
  const [inputValue, setinputValue] = React.useState('');

  //displays an error message when the connection fail
  const [error, seterror] = React.useState(false);

  //pass it to the component your want to redraw and trigger it by changing it's state
  const [redraw, setredraw] = React.useState(false);

  React.useEffect(() => {

    //refresh the data automatically in set intervals
    const interval = setInterval(() => getBoard(), 2000); //change the refresh rate here

    //fetch board from backend
    if (!boardLoaded)
      getBoard();

    //redraw board on frontend
    else
      setBoard(Board);

    return () => {
      clearInterval(interval);
    };
  }, [Board]);


  //fetches all the board lists and the cards within them as one JSON
  const getBoard = () => {
    setboardLoaded(true);
    console.log(`Data Refreshed`);
    axios
      .get(`${serverURL}/boardcontents`)
      .then(response => {
        setredraw(true);
        setBoard(response.data);
        setredraw(false);
      })
      .catch(err => {
        //can be modified to change reconnection behavior
        seterror(true);
        setboardLoaded(false);
        console.log(err);
      });
  };

  const addCard = (chosenList: number) => {
    if (Board) {
      setLoading(true);
      axios.post(`${serverURL}/cards/new`, {
        listid: Board[chosenList].id,
        name: inputValue
      })
        .then(() => {
          setLoading(false);
          setinputValue('');
          getBoard();
        })
        .catch(() => {
          setLoading(false);
          seterror(true);
        });
    }
  };

  //handles moving from one list to another called by a child component
  const moveCard = (e: React.ChangeEvent<HTMLInputElement>, from: number, to: number) => {
    if (Board) {
      axios.put(`${serverURL}/cards:${e.target.value}`, { idList: Board[to].id })
        .then(() => {
          getBoard();
        })
        .then(() => { setBoard(Board); })
        .catch(err => {
          seterror(true);
          console.log(err);
        });
    }
  };


  const deleteListContent = (id: string) => {
    axios
      .post(`${serverURL}/cards/archiveList`, { listid: id })
      .then(() => {
        getBoard();
      })
      .then(() => { setBoard(Board); })
      .catch(err => {
        seterror(true);
        console.log(err);
      });
  };

  //add card text change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setinputValue(e.target.value);
  };

  //submit button clicked
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    addCard(0);
    e.preventDefault();
  };

  //Checks if we have our data or not and throws error messages, also displays a spinner for loading
  if (!Board || Board.length === 0 || !Array.isArray(Board)) { //timeout for fetching data (connection error)
    setTimeout(() => { seterror(true); }, 20000);
    return (
      <div>
        {error === true ? <Alert onClick={() => window.location.reload()} variant={'warning'}>
          Connection Error, Click To Refresh (Use VPN if you are blocked from Trello)
        </Alert> : <div className='customSpin'>
          <Spinner animation="border" role="status" />
        </div>}
      </div>
    );
  }
  else
    return (
      <Container style={{ marginTop: "1rem" }}>
        <Row>
          {/* Draws the boards and their contents */}
          {Board && Board.map((list: any) => (
            <Col key={list.id}>
              <Card>
                <Card.Header>{list.name}</Card.Header>
                <Card.Body>
                  <ListItem
                    serverURL={serverURL}
                    name={list.name}
                    id={list.id}
                    cards={list.cards}
                    moveCard={moveCard}
                    redraw={redraw}
                  />
                </Card.Body>
              </Card>

              {/* Draws the button and input box specific for the lists conditionally */}
              {
                (list.name === 'To Do') ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mt-1">
                      <Form.Control onChange={handleChange} value={inputValue} type="text" className="mt-1" placeholder="Add A Card" />
                      <Button disabled={isLoading}
                        variant="dark" className="mt-1" type="submit">
                        {isLoading ? 'Updating…' : 'Submit'}
                      </Button>
                    </Form.Group>
                  </Form>
                )
                  : (<Button variant="dark" className="mt-1" onClick={() => deleteListContent(list.id)}>Archive All</Button>)
              }
            </Col>
          ))}
        </Row>
      </Container >
    );
};

export default BoardContainer;
