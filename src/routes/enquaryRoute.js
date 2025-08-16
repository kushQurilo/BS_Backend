const {
  addToEquary,
  getAllEnquary,
  getSingleEnquary,
  getAllEnquaryToAdmin,
} = require("../controllers/AddToEnquary/addEnquarycontroller");
const { adminAuthentication } = require("../middlewares/AdminAuthetication");
const { roleAuthetication } = require("../middlewares/roleBaseAuthe");

const enquaryRouter = require("express").Router();
enquaryRouter.post("/", addToEquary);
enquaryRouter.get("/", getAllEnquary);
enquaryRouter.get("/single/:id", getSingleEnquary);
enquaryRouter.get(
  "/all",
  adminAuthentication,
  roleAuthetication("admin"),
  getAllEnquaryToAdmin
);
module.exports = enquaryRouter;
