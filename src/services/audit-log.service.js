const { prisma } = require("../lib/prisma");

async function logAction(
  tx,
  { action, entity, entityId, actorId = null, actorRole = null, details = null }
) {
  return tx.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      actorId,
      actorRole,
      details,
    },
  });
}

module.exports = { logAction };