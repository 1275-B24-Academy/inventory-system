function requireRoles(allowedRoles) {
  return function (req, res, next) {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này",
        code: "FORBIDDEN"
      });
    }

    next();
  };
}

module.exports = requireRoles;