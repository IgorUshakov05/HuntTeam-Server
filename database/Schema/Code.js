const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CodeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => v4(),
    required: true,
  },
  code: {
    type: Number,
    default: generateSixDigitCode(),
  },
  role: {
    type: String,
    enum: ["manager", "admin"],
    required: true,
  },
});
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

const model = mongoose.model("Code", CodeSchema);
module.exports = model;
