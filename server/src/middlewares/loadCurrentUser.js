function loadCurrentUser(userRepository) {
  return async function (req, res, next) {
    try {
      // Lấy tài khoản theo ID mà requireLogin đã xác minh.
      const user = await userRepository.findById(
        req.auth.userId
      );

      if (!user) {
        return res.status(401).json({
          message: "Tài khoản không còn tồn tại",
          code: "AUTH_REQUIRED"
        });
      }

      if (user.status !== "active") {
        return res.status(403).json({
          message: "Tài khoản chưa được kích hoạt hoặc đã bị khóa",
          code: "ACCOUNT_INACTIVE"
        });
      }

      // Giữ thông tin tài khoản cho bước kiểm tra quyền.
      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = loadCurrentUser;