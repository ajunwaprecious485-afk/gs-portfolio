const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page.',
    user: null
  });
};

const setLocals = (req, res, next) => {
  res.locals.user = req.session.userId ? {
    _id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
    role: req.session.role
  } : null;
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  next();
};

module.exports = { isAuthenticated, isAdmin, setLocals };
