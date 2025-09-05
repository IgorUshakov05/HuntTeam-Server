const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ApplicationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => v4(),
    required: true,
  },
  client_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  time_stamp: {
    type: Date,
    default: new Date,
  },
  message: {
    type: String,
  },
  file: {
    type: String,
  },
  messageIDs: [
    {
      chat_id: {
        type: String,
        required: true,
      },
      message_id: {
        type: Number,
        required: true,
      },
    },
  ],
});

const model = mongoose.model("Application", ApplicationSchema);
module.exports = model;
