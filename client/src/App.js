import React from 'react';
import BoardContainer from './components/BoardContainer';
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <Header />      
        <BoardContainer serverURL={process.env.REACT_APP_Server_URL} />
      <Footer/>
    </div>
  );
}

export default App;
