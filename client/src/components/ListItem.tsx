import React from "react";
import { Form } from "react-bootstrap";
import { TrelloCard } from "../interfaces/general";

interface props {
  serverURL: string;
  name: string;
  id: string;
  cards: TrelloCard[];
  moveCard: any;
  redraw: boolean;
}

const ListItem = (props: props) => {
  let cards;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //event e, from, to
    props.moveCard(e, 0, 1);
  };

  if (!props.cards) { return (<div></div>); }
  else {
    cards = Object.values(props.cards);
    if (props.name.toLowerCase() === 'to do') {
      //if we are on the ToDo list
      return (
        <div>
          {cards && cards.map((item: TrelloCard) => (
            <Form.Check type="checkbox" key={item.id} label={item.name} onChange={handleChange} value={item.id} />))}
        </div>
      );
    } else {
      //if we are on the Done list
      return (
        <div>
          {cards && cards.map((item: TrelloCard) => (
            <ul key={item.id}>
              <Form.Check type="checkbox" children={(<li>{item.name}</li>)} label={item.name} onChange={props.moveCard} />
            </ul>
          ))}
        </div>
      );
    }
  }
};

export default ListItem;
