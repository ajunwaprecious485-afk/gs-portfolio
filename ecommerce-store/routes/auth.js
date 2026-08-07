const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.render('auth/register', { title: 'Register', error: 'Passwords do not match' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', { title: 'Register', error: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;
    res.redirect('/');
  } catch (err) {
    res.render('auth/register', { title: 'Register', error: 'Registration failed. Please try again.' });
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password' });
    }
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Login failed. Please try again.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
