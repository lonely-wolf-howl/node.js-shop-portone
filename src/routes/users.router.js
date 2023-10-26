const express = require('express');
const router = express.Router();

const passport = require('passport');

const sendEmail = require('../mail/mail');

const User = require('../models/users.model');

// signup
router.post('/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendEmail(process.env.GOOGLE_EMAIL_ID, user.email, 'welcome');
    res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
});

// login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return next(error);
    if (!user) return res.json({ message: info });

    req.login(user, function (error) {
      if (error) return next(error);
      res.redirect('/products');
    });
  })(req, res, next);
});

// google login
router.get('/google', passport.authenticate('google'));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/products',
    failureRedirect: '/login',
  })
);

// kakao login
router.get('/kakao', passport.authenticate('kakao'));
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
  })
);

// logout
router.post('/logout', (req, res, next) => {
  req.logout(function (error) {
    if (error) return next(error);
    res.redirect('/');
  });
});

module.exports = router;
