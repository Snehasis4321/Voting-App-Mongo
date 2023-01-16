module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/login");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  next();
};
