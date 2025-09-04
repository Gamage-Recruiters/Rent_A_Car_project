const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10); // 10 salt rounds
}

async function checkPassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

module.exports = { hashPassword, checkPassword };
