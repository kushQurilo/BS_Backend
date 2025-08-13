const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  name:{
    type:String
  },
  price:{
    type:Number,
    required:[true, 'price is required']
  },
  categoryId:{
    type:mongoose.Schema.Types.ObjectId,
    required:[true, 'categoryId is required'],
    ref:'Category'
  },
  qunatity:{
    type:String,
    default:1
  },
  description:{
    type:String
  },
  carter:{
    type:Number,
    default:0
  },
  isFeature:{
    type:Boolean,
    default:false
  },
  images:{
    type:[String],
    default:[]
  },
  points:{
    type:[String],
    default:[]
  }
})

module.exports = mongoose.model('Product',productSchema);