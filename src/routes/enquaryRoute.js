const {
  addToEquary,
  getAllEnquary,
  getSingleEnquary,
  getAllEnquaryToAdmin,
  deleteEnquary,
} = require("../controllers/AddToEnquary/addEnquarycontroller");
const { adminAuthentication } = require("../middlewares/AdminAuthetication");
const { roleAuthetication } = require("../middlewares/roleBaseAuthe");

const enquiryRouter = require("express").Router();
enquiryRouter.post("/", addToEquary);
enquiryRouter.get("/", getAllEnquary);
enquiryRouter.get("/single/:id", getSingleEnquary);
enquiryRouter.get(
  "/all",
  adminAuthentication,
  roleAuthetication("admin"),
  getAllEnquaryToAdmin
);
enquiryRouter.delete("/:id", deleteEnquary);
module.exports = enquiryRouter;
