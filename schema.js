const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  pincode: Number,
  contact: Number,
  password: String,
});

const workerSchema = new Schema({
  name: String,
  description: { type: String, default: "No description available" },
  email: String,
  address: String,
  city: String,
  pincode: Number,
  contact: Number,
  profession: String,
  rating: { type: Number, default: 2 },
  noofratings: { type: Number, default: 0 },
  reviews: [{ reviewer: String, review: String, rating: Number}],
  password: String,
  status: { type: String, default: "available" },
});

const bookingSchema=new Schema({
  workerid: { type: Schema.Types.ObjectId, ref: 'Workers' },
  userid: { type: Schema.Types.ObjectId, ref: 'Users' },
  date:Date,
  time:String,
  locationLink:String,
  problem:String,
  problemStatement:String,
  paymentstatus:{type:String,default:'pending'},
  bookingstatus:{type:String,default:'pending'},
  reviewstatus:{type:String,default:'pending'},
  baseprice:{type:Number,default:700},
});
module.exports = {
  Users: mongoose.model("Users", userSchema),
  Workers: mongoose.model("Workers", workerSchema),
  Bookings: mongoose.model("Bookings", bookingSchema)
};
