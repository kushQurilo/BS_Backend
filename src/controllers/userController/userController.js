const { default: mongoose } = require("mongoose");
const userModel = require("../../models/userModel");
const {
  hashPassword,
  compareHashPassword,
} = require("../../utitlies/hashyPassword");
const jwt = require("jsonwebtoken");
const { isValidGST } = require("../../utitlies/gstValidation");
const twilioClient = require("../../config/Twilio/TwilioConfig");
const { genrateOTP } = require("../../utitlies/genrateOtp");
const otpStore = {};
const otpStoreTest = {};
exports.userSignup = async (req, res, next) => {
  try {
    const { name, email, password, address, gstnumber, phone } = req.body;
    if (!name || !email || !password || !address || !gstnumber || !phone) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const gstTest = isValidGST(gstnumber);
    if (!gstTest) {
      return res.json({
        success: false,
        message: "Invalid GST Number",
      });
    }
    if (phone.length !== 10) {
      return res.json({
        success: false,
        message: "Phone number should be 10 digits",
      });
    }
    const payload = {
      name,
      email,
      password: hashPassword(password),
      address,
      gstnumber,
      phone,
    };
    const user = await userModel.create(payload);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Faild to signup try again", success: false });
    }
    return res.status(200).json({
      message: "singup successfully admin will approve your profile.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get single user
exports.getSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//user login
exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password missing" });
    }
    const isUser = await userModel.findOne({ email });
    if (!isUser) {
      return res.status(404).json({ message: "Email not register" });
    }
    const match = await compareHashPassword(password, isUser.password);
    if (match) {
      const token = jwt.sign({ id: isUser._id }, process.env.customerKey, {
        expiresIn: "7d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      if (isUser) {
        if (isUser.status === "pending") {
          return res.status(200).json({
            success: true,
            message:
              "Your Profile is not approved by admin please wait for approval",
          });
        }
        return res.status(200).json({
          success: true,
          message: "login Success",
          aprroval: "aprroved",
          token,
          id: isUser._id,
        });
      } else {
        return res.status(400).json({ message: "invalid password" });
      }
    }
    return res.status(200).json({
      success: false,
      message: "Invalid password ",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//logout

exports.userLogout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: "true",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ success: true, message: "logout Success" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//

// forget password

exports.forgetUserPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const isExist = await userModel.findOne({ phone });
    if (!isExist) {
      return res.status(404).json({
        success: false,
        message: "Phone number is not registered",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000); // 4 number otp

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    return res.status(200).json({
      success: true,
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    const { _id, password } = req.body;
    if (!_id || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const isUser = await userModel.findById(_id);
    if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "Password change failed: user does not exist.",
      });
    }
    const hasPass = await hashPassword(password);
    isUser.password = hasPass;
    await isUser.save();
    return res.status(200).json({
      success: true,
      message: "Password Change.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// verifyOtp then update

exports.verifyOTPS = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone, OTP, and new password are required",
      });
    }
    const storedData = otpStore[phone];
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this number. Please request again.",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (String(storedData.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    delete otpStore[phone];
    return res.status(200).json({
      success: true,
      message: "Otp Verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.testOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = genrateOTP();
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await twilioClient.messages.create({
      body: `your otp ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });
    return res.json({ messages: "Otp send successfully" });
  } catch (error) {
    return res.json({ error, message: error.message });
  }
};

exports.testOtpVerify = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (otpStoreTest[phone] && otpStoreTest[phone] == otp) {
      delete otpStoreTest[phone];
      return res.json({ message: "verify" });
    }
  } catch (error) {
    return res.json({ error, message: error.message });
  }
};
