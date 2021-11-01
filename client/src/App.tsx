import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ProductList from "./pages/ProductList";
import Home from './pages/Home'
import FullShoePage from './pages/FullShoePage'

const App = () => {

  
  return (
    <Router>

      <div className="m-0 box-border">
        

        <Switch>
          <Route path="/shoes">
            <ProductList />
          </Route>

          <Route path="/shoe/:shoeID">
            <FullShoePage />
          </Route>


          <Route path="/">
            <Home />
          </Route>

        </Switch>
      </div>

    
    </Router>

  );
}

export default App;
