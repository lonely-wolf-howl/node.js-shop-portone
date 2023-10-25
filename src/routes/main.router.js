const express = require('express');
const mainRouter = express.Router();

const { checkNotAuthenticated } = require('../middleware/auth');

mainRouter.get('/', (req, res) => {
  res.redirect('/products');
});

mainRouter.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('auth/signup');
});

mainRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('auth/login');
});

module.exports = mainRouter;
