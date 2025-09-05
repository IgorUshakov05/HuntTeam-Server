const Application = require("../Schema/Application");

async function create_application({
  client_name,
  phone,
  message = null,
  file = null,
}) {
  try {
    let newApplication = new Application({
      client_name,
      phone,
      message,
      file,
    });

    await newApplication.save();
    return { success: true, id: newApplication.id };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

async function add_chats_id(id, messageIDs) {
  try {
    if (!id || !Array.isArray(messageIDs)) {
      throw new Error("Invalid input: id and messageIDs (array) are required");
    }
    let application = await Application.findOneAndUpdate(
      { id },
      { $set: { messageIDs } }
    );
    if (!application) {
      throw new Error(`Application with id ${id} not found`);
    }
    return { success: true, application };
  } catch (error) {
    console.error("Error in add_chats_id:", error.message);
    throw error;
  }
}

async function get_application_on_id(id) {
  let application = await Application.findOne({ id });

  if (!application) return { success: false, message: "Заявка уже взята" };
  return { success: true, application };
}

module.exports = { create_application, get_application_on_id, add_chats_id };
