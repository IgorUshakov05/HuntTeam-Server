const mongoose = require("mongoose");
const { v4 } = require("uuid");

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => v4(),
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["manager", "admin"],
    required: true,
  },
  chat_id: {
    type: String,
    required: true,
  },
});

const model = mongoose.model("User", UserSchema);
module.exports = model;
