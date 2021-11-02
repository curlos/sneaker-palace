import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ProductList from "./pages/ProductList";
import Navbar from "./components/Navbar";
import Home from './pages/Home'
import FullShoePage from './pages/FullShoePage'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import { Footer } from "./components/Footer";

const App = () => {

  
  return (
    <Router>

      <div className="m-0 box-border">
        

        <Switch>
          <Route path="/shoes">
            <Navbar />
            <ProductList />
          </Route>

          <Route path="/shoe/:shoeID">
            <Navbar />
            <FullShoePage />
          </Route>

          <Route path="/login">
            <Navbar />
            <Login />
          </Route>

          <Route path="/register">
            <Navbar />
            <Register />
          </Route>

          <Route path="/cart">
            <Navbar />
            <Cart />
          </Route>


          <Route path="/">
            <Home />
          </Route>

        </Switch>

        <Footer />
      </div>

    
    </Router>

  );
}

export default App;
