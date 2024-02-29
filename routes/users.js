const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')

//User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

//Login page
router.get('/login', (req, res) => res.render('login'));
//Register page
router.get('/register', (req, res) => res.render('register'));


//Register Handle
router.post('/register', (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, age, country, gender, password, password2 } = req.body;
    let errors = [];

    if (!firstName || !lastName || !email || !age || !country || !gender || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            firstName,
            lastName,
            email,
            age,
            country,
            gender,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    firstName,
                    lastName,
                    email,
                    age,
                    country,
                    gender,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    age,
                    country,
                    gender,
                    password
                });
                console.log(newUser);
               

                    bcrypt.genSalt(10, (err, salt) => {
                      bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                          .save()
                          .then(user => {
                            req.flash(
                              'success_msg',
                              'You are successfully registered! Please log in'
                            );
                            res.redirect('/users/login');
                          })
                          .catch(err => console.log(err));
                      });
                    });
            }


        });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout;
  router.get("/logout", (req, res, next) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      req.flash('success_msg', 'You are logged out');
      res.redirect('/users/login');
    });
   
  });


        module.exports = router;