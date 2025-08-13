const { default: mongoose } = require("mongoose");
const ProductModel = require("../../models/productModel");
const cloudinary = require('../../config/cloudinary/cloudinary')
const fs = require('fs');
exports.createProduct = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    const images = [];
    const { name, price, description, categoryId, points } = req.body;

    if (!name || !price || !description || !categoryId) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Upload images to Cloudinary
    for (const file of files) {
      const uploadCloud = await cloudinary.uploader.upload(file.path, {
        folder: "BS Products"
      });
      images.push(uploadCloud.secure_url);
      fs.unlinkSync(file.path); // delete from local after upload
    }

    // Parse points (make sure it's an array)
    let parsedPoints = [];
    if (points) {
      // If `points` comes as a JSON string (like from Postman or frontend), parse it
      parsedPoints = typeof points === 'string' ? JSON.parse(points) : points;

      if (!Array.isArray(parsedPoints)) {
        return res.status(400).json({ message: "Points must be an array of strings" });
      }
    }

    // Build payload
    const payload = {
      name,
      price,
      description,
      categoryId,
      images,
      points: parsedPoints
    };

    // Create product
    const product = await ProductModel.create(payload);

    if (!product) {
      return res.status(400).json({ message: "Failed to create product" });
    }

    return res.status(201).json({
      message: "Product created successfully",
      success: true,
      product
    });

  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ message: err.message, success: false });
  }
};
// get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const products = await ProductModel.find({})
            .skip(skip)
            .limit(limit);

        const totalProducts = await ProductModel.countDocuments();

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found", success: false });
        }

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalResults: totalProducts,
            products
        });
    } catch (err) {
        return res.status(500).json({ message: err.message, success: false });
    }
};



// get single products 
exports.getSingleProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await ProductModel.findById(id);
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }
        res.status(200).json({ product, success: true });
    } catch (err) {
        return res.status(400).json({ message: err.message, success: false })
    }
}


// update product
exports.updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const productId = new mongoose.Types.ObjectId(id)
        const { name, price, description, categoryId } = req.body;
        if (!name || !price || !description || !categoryId) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const payload = { name, price, description, categoryId };
        const product = await ProductModel.findByIdAndUpdate(productId, payload, { new: true });
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }
        return res.status(200).json({ product, success: true });
    } catch (err) {
        return res.status(400).json({ message: err.message, success: false })
    }
}
// delete products
exports.deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const productId = new mongoose.Types.ObjectId(id)
        const product = await ProductModel.findByIdAndDelete(productId);
        if (!product) {
            return res.status(400).json({ message: "Product not found", success: false });
        }
        return res.status(500)
            .json(
                {
                    success: true,
                    message: "peroduct delete"
                })
    } catch (err) {

        return res.status(500)
            .json(
                {
                    success: false,
                    message: err.message
                })
    }
}


// similor product
exports.similarProduct = async (req, res, next) => {
    try {
        const pageNo = Number(req.query.pageno);
        const id = req.body.id || req.query.id || 0;  // allow flexibility
        console.log("Category ID:", id);

        if (!id || !pageNo) {
            return res.status(400).json({ status: "success", message: "Missing id or pageno" });
        }

        const limit = 5;
        const catId = new mongoose.Types.ObjectId(id);

        const totalCount = await ProductModel.countDocuments({ categoryId: catId });
        const totalPage = Math.ceil(totalCount / limit);

        if (pageNo <= totalPage) {
            const offset = (pageNo - 1) * limit;
            const getProduct = await ProductModel.find({ categoryId: catId })
                .skip(offset)
                .limit(limit);

            return res.json({
                status: "success",
                message: "Products fetched successfully",
                data: getProduct,
                pages: totalPage
            });
        } else {
            return res.json({
                status: "fail",
                message: "Page number exceeds available pages"
            });
        }

    } catch (err) {
        console.error("Error fetching similar products:", err);
        res.status(500).json({
            status: "fail",
            message: "Unable to find products",
            error: err.message
        });
    }
};

// featuered products 
exports.featuredProducts = async (req, res, next) => {
    try {
        const featuered = await ProductModel.find({ isFeature: true }).select("-__v");
        if (!featuered) {
            return res.status(404)
                .json({
                    success: false,
                    message: "failed to fetch..."
                })
        }
        return res.status(200)
            .json({
                success: true,
                data: featuered
            })
    } catch (err) {
        return res.status(500)
            .json({
                success: false,
                message: err.message
            })
    }
}