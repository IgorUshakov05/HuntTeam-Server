const mongoose = require("mongoose");

const DirectorSchema = new mongoose.Schema({
  chatid: {
    type: String,
  },
});

const model = mongoose.model("Director", DirectorSchema);
module.exports = model;
