module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please Log In!');
      res.redirect('/users/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/dashboard');      
    },
    isAdmin: function (req, res, next) {
      if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
      }
      req.flash('error_msg', 'You are not admin');
      res.redirect('/dashboard'); 
    }
  };
  