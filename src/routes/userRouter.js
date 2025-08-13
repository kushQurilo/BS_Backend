const {
  userSignup,
  pendingProfiles,
  getSingleUser,
  userLogin,
  forgetUserPassword,
  verifyOTPS,
  testOtp,
  testOtpVerify,
  changePassword,
} = require("../controllers/userController/userController");

const userRoutes = require("express").Router();
userRoutes.post("/singup", userSignup);
userRoutes.get("/single-user/:id", getSingleUser);
userRoutes.post("/login", userLogin);
userRoutes.post("/forget-password", forgetUserPassword);
userRoutes.post("/verify", verifyOTPS);
userRoutes.post("/change-password", changePassword);
userRoutes.post("/otp-send", testOtp);
userRoutes.post("/verify-otp", testOtpVerify);
// userRoutes.get('/pending-profile',pendingProfiles);

module.exports = userRoutes;
