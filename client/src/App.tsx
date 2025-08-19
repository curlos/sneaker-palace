import React, { useState } from "react";
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router, Redirect, Route, Switch
} from "react-router-dom";
import { Footer } from "./components/Footer";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import ShoppingCartModal from "./components/ShoppingCartModal";
import SidenavModal from "./components/SidenavModal";
import StripeContainer from "./components/StripeContainer";
import Cart from "./pages/Cart";
import CheckoutForm from "./pages/CheckoutForm";
import Favorites from "./pages/Favorites";
import FullShoePage from './pages/FullShoePage';
import Home from './pages/Home';
import Login from "./pages/Login";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProductList from "./pages/ProductList";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ReviewForm from "./pages/ReviewForm";
import Settings from "./pages/Settings";
import { RootState } from "./redux/store";

const App = () => {

  const user = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSidenavModal, setShowSidenavModal] = useState(false)
  const [showShoppingCartModal, setShowShoppingCartModal] = useState(false)

  return (
    <Router>

      <div className="m-0 box-border font-urbanist min-h-screen flex flex-col">

        {showSearchModal ? <SearchModal showSearchModal={showSearchModal} setShowSearchModal={setShowSearchModal} /> : null}

        {showSidenavModal ? <SidenavModal showSidenavModal={showSidenavModal} setShowSidenavModal={setShowSidenavModal} /> : null}

        {showShoppingCartModal ? <ShoppingCartModal showModal={showShoppingCartModal} setShowModal={setShowShoppingCartModal} /> : null}

        <Navbar setShowSearchModal={setShowSearchModal} setShowSidenavModal={setShowSidenavModal} />

        <div className="flex-grow flex flex-col">
          <Switch>
          <Route path="/login" exact>
            <Login />
          </Route>

          <Route path="/register" exact>
            {user && Object.keys(user).length > 0 ? <Redirect to='/' /> : (
              <span>
                <Register />
              </span>
            )}
          </Route>

          <Route path="/cart" exact>
            <Cart />
          </Route>

          <Route path="/payment" exact>
            <StripeContainer children={<CheckoutForm />} />
          </Route>

          <Route path="/payment-success" exact>
            <StripeContainer children={<PaymentSuccess />} />
          </Route>

          <Route path="/shoes" exact>
            <ProductList />
          </Route>

          <Route path="/shoe/:shoeID" exact>
            <FullShoePage setShowShoppingCartModal={setShowShoppingCartModal} />
          </Route>

          <Route path="/shoe/submit-review/:shoeID" exact>
            {user && Object.keys(user).length === 0 ? <Redirect to='/login' /> : (
              <span>
                <ReviewForm />
              </span>
            )}
          </Route>

          <Route path="/shoe/edit-review/:shoeID/:reviewID" exact>
            {user && Object.keys(user).length === 0 ? <Redirect to='/login' /> : (
              <span>
                <ReviewForm />
              </span>
            )}
          </Route>

          <Route path="/profile/:userID" exact>
            {user && Object.keys(user).length === 0 ? <Redirect to='/' /> : (
              <Profile />
            )}
          </Route>

          <Route path="/orders" exact>
            {user && Object.keys(user).length === 0 ? <Redirect to='/' /> : (
              <span>
                <Orders />
              </span>
            )}
          </Route>

          <Route path="/order-details/:id" exact>
            <OrderDetails />
          </Route>

          <Route path="/favorites" exact>
            {user && Object.keys(user).length === 0 ? <Redirect to='/' /> : (
              <span>
                <Favorites />
              </span>
            )}
          </Route>

          <Route path="/settings" exact>
            {!user ? <Redirect to='/' /> : (
              <span>
                <Settings />
              </span>
            )}
          </Route>


          <Route path="/">
            <Home />
          </Route>

          </Switch>
        </div>

        <Footer />
      </div>


    </Router>

  );
}

export default App;
