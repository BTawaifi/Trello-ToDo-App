import React from "react";
import { Form } from "react-bootstrap";

const ListItem = (props) => {
  let cards

  const handleChange = (e) => {
    //event e, from, to
    props.moveCard(e,0,1)
  }

  if (!props.cards) { return (<div></div>) }
  else {
    cards = Object.values(props.cards)
    if (props.name.toLowerCase() === 'to do') {
      //if we are on the ToDo list
      return (
        <div>
          {cards && cards.map((item) => (
            <Form.Check type="checkbox" key={item.id} label={item.name} onChange={handleChange} value={item.id} />))}
        </div>
      )
    } else {
      //if we are on the Done list
      return (
        <div>
          {cards && cards.map((item) => (
            <ul key={item.id}>
              <Form.Check type="checkbox" children={(<li>{item.name}</li>)} label={item.name} onChange={props.moveCard} />
            </ul>
          ))}
        </div>
      )
    }
  }
};

export default ListItem;
