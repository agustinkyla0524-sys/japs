const { User, Notification } = require("../models");
const { OWNER_LEVEL_ROLES } = require("../middleware/auth");

// Never throws: a failed notification must not break the real action.
const createNotification = async ({ userId, type, title, message, link = null }) => {
  if (!userId) return;
  try {
    await Notification.create({ user_id: userId, type, title, message, link });
  } catch (err) {
    console.error("Notification create failed:", err);
  }
};

// One notification per active user holding any of the roles.
const notifyRoles = async (roles, { type, title, message, link = null }) => {
  try {
    const users = await User.findAll({
      where: { role: roles, is_active: true },
      attributes: ["id"],
    });
    if (users.length === 0) return;
    await Notification.bulkCreate(
      users.map((u) => ({ user_id: u.id, type, title, message, link })),
    );
  } catch (err) {
    console.error("Role notification failed:", err);
  }
};

const notifyOwners = (payload) => notifyRoles(OWNER_LEVEL_ROLES, payload);

module.exports = { createNotification, notifyRoles, notifyOwners };