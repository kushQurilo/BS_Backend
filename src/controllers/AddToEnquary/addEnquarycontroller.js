const { default: mongoose, mongo } = require("mongoose");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const enquaryModel = require("../../models/enquaryModel");

// add enquary for user
exports.addToEquary = async (req, res) => {
  try {
    const { productId, id } = req.body;

    if (!id) {
      return res
        .status(200)
        .json({ success: false, message: "User id missing" });
    }
    if (!productId) {
      return res
        .status(200)
        .json({ success: false, message: "Product id missing" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(200)
        .json({ success: false, message: "User id must be ObjectId" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(200)
        .json({ success: false, message: "Product id must be ObjectId" });
    }

    const isUser = await userModel.findById(id);
    if (!isUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isProduct = await productModel.findById(productId);
    if (!isProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    const alreadyProduct = await enquaryModel.findOne({
      user_id: id,
      productId,
    });
    if (alreadyProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Enquiry Already Exist" });
    }
    await enquaryModel.create({
      user_id: id,
      productId,
    });

    return res.status(200).json({ success: true, message: "Enquiry added..." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// get all enquary to each user
exports.getAllEnquary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).json({
        success: false,
        message: "User id required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        success: false,
        message: "User id must be Object ID",
      });
    }
    const isUser = await userModel.findById(id);
    if (!isUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid User",
      });
    }
    const Enquary = await enquaryModel
      .find({ user_id: id })
      .populate("productId", "-__v")
      .populate("user_id", "-password -__v");
    if (!Enquary || Enquary.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User Enquary not exist",
      });
    }
    return res.status(200).json({
      success: true,
      data: Enquary,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, error });
  }
};

// delete enquary
exports.deleteEnquary = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquary id required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Enquary id must be ObjectId",
      });
    }

    const enquary = await enquaryModel.findByIdAndDelete(id);
    if (!enquary) {
      return res.status(404).json({
        success: false,
        message: "Enquary not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Enquary deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

//get single enquary
exports.getSingleEnquary = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        success: false,
        message: "enquary id required and id must be objectId",
      });
    }
    const isEqnuary = await enquaryModel
      .findById(id)
      .populate("user_id", "-password -__v -status ")
      .populate("productId");
    if (!isEqnuary) {
      return res.status(400).json({
        success: false,
        message: "enquary not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: isEqnuary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// get all enquary to admin
exports.getAllEnquaryToAdmin = async (req, res) => {
  try {
    const enquiries = await enquaryModel
      .find({})
      .populate("productId", "-__v")
      .populate("user_id", "-password -__v -status");

    if (!enquiries || enquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No enquiries found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    console.log("message", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
