const express = require('express')
const passport = require("passport");
const User = require('../models/User')
const bcrypt = require("bcryptjs")
const router = express.Router()

router.get('/', (req, res) => {
  console.log(req.user)
  res.json(req.user)
})

router.get("/logout", (req, res) => {
  console.log('Logging out user')
  const user = req.user
  req.logout();
  res.json({...user})
});

router.post("/register", async (req, res, next) => {
  const newEmail = req.body.email
  const newPassword = req.body.password

  const userFound = await User.find({lowerCaseEmail: newEmail.toLowerCase().trim()})

  if (userFound.length > 0) {
    return res.json({error: 'Email taken'})
  }

  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      return err
    }

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      reviews: [],
      shoeFavorites: [],
      reviewFavorites: [],
      lowerCaseEmail: req.body.email.toLowerCase(),
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }).save((err, result) => {
      if (err) { 
        return next(err);
      }
      console.log('no err')
      res.json({'result': result})
    });
  })
});

router.post("/login", (req, res, next) => {

  console.log(req.body)
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.json({user: req.user});
        console.log(req.user);
      });
    }
  })(req, res, next);
});

router.get('/user/:id', async (req, res) => {

  const user = await User.findOne({_id: req.params.id})

  if (!user) {
    return res.send('User not found')
  }

  return res.json(user)
})

module.exports = router;