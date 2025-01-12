const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/customers');
  }
);

router.get('/user', (req, res) => {
  console.log('User Session:', req.session); // Log session details
  console.log('Authenticated User:', req.user); // Log user details

  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('http://localhost:3000/login');
});

module.exports = router;