import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import ProductList from "./pages/ProductList";
import Navbar from "./components/Navbar";
import Home from './pages/Home'
import FullShoePage from './pages/FullShoePage'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import { Footer } from "./components/Footer";
import { useSelector } from 'react-redux'
import { RootState } from "./redux/store";
import ReviewForm from "./pages/ReviewForm";

const App = () => {

  const user = useSelector((state: RootState) => state.user.currentUser)
  
  return (
    <Router>

      <div className="m-0 box-border">
        

        <Switch>
          <Route path="/shoes" exact>
            <Navbar />
            <ProductList />
          </Route>

          <Route path="/shoe/:shoeID" exact>
            <Navbar />
            <FullShoePage />
          </Route>

          <Route path="/shoe/submit-review/:shoeID" exact>
            <Navbar />
            <ReviewForm />
          </Route>

          <Route path="/login" exact>
            <Navbar />
            <Login />
          </Route>

          <Route path="/register" exact>
            {user ? <Redirect to='/' /> : (
              <span>
                <Navbar />
                <Register />
              </span>
            )}
            
          </Route>

          <Route path="/cart" exact>
            <Navbar />
            <Cart />
          </Route>


          <Route path="/" exact>
            <Navbar />
            <Home />
          </Route>

        </Switch>

        <Footer />
      </div>

    
    </Router>

  );
}

export default App;
