const express = require('express');
const router = express.Router();

const { checkNotAuthenticated } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('auth/signup');
});

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('auth/login');
});

module.exports = router;
