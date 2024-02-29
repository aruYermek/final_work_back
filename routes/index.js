const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, isAdmin } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);
 // Admin
 router.get('/admin', ensureAuthenticated, isAdmin, (req, res) => {
  res.render('admin', {
    user: req.user
  }); 
});


module.exports=router;