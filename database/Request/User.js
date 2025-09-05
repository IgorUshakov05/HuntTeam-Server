const UserSchema = require("../Schema/User");
const CodeSchema = require("../Schema/Code");

async function create_user(role, fullname, code, chat_id) {
  try {
    let findCode = await CodeSchema.findOne({ code, role });
    if (!findCode)
      return { success: false, message: "Ссылка не действительна" };
    let findUser = await UserSchema.findOne({ chat_id });
    if (findUser) return { success: false, message: "Вы уже в системе" };
    let newUser = new UserSchema({ fullname, role, chat_id });
    await newUser.save();
    await CodeSchema.deleteOne({ code });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
async function find_user(chat_id) {
  try {
    let user = await UserSchema.findOne({ chat_id });
    return { success: true, user };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

async function get_all_users() {
  let users = await UserSchema.find({});
  return users;
}

async function get_menagers() {
  let users = await UserSchema.find({ role: "manager" });
  return users;
}

async function delete_user_by_id(id) {
  try {
    let findUser = await UserSchema.findOneAndDelete({ id });
    if (!findUser) return { success: false, message: "Пользователь не найден" };
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

async function is_admin(chat_id) {
  try {
    let user = await UserSchema.findOne({ chat_id, role: "admin" });
    if (!user) return { success: false, message: "У вас нет прав" };
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  create_user,
  find_user,
  get_all_users,
  delete_user_by_id,
  is_admin,
  get_menagers,
};
