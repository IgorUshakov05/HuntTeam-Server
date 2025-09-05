const DirectorSchema = require("../Schema/Director");

async function set_chat_id(id) {
  try {
    let find_chat_id = await DirectorSchema.findOne({ chatid: id });
    if (find_chat_id) return { success: true };
    let chatId = new DirectorSchema({ chatid: id });
    await chatId.save();
    return { success: true };
  } catch (error) {
    return { success: false, message: error };
  }
}

async function get_chat_id_director() {
  try {
    let find_chat_id = await DirectorSchema.find({});
    if (!find_chat_id)
      return { success: false, message: "Директор не зарегестрирован" };
    return { success: true, chat_id: find_chat_id[0].chatid };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { set_chat_id, get_chat_id_director };
