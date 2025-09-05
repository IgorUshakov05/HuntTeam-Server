const CodeSchema = require("../Schema/Code");

async function create_manager_code(role) {
  try {
    let newCode = new CodeSchema({ role });
    await newCode.save();
    return { success: true, code: newCode.code };
  } catch (error) {
    return { success: false, message: error };
  }
}

module.exports = { create_manager_code };
