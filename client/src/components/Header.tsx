import React from "react";
import { Navbar, Container, Image } from "react-bootstrap";
import Avatar from "../assets/logo.png";

const Header = () => {
  return (
    <header>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            <Image src={Avatar} width={42} style={{ marginRight: "10px" }} />
            Trello ToDo App
          </Navbar.Brand>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
