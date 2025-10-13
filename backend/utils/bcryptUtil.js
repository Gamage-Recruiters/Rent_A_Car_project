const bcrypt = require('bcryptjs');

async function  hashPassword(password) {
    
    const hashedPassword = await bcrypt.hash(password,10);
    return hashedPassword;

}


async function checkPassword(userPassword,dbHashedPassword) {

    const isMatch = await bcrypt.compare(userPassword,dbHashedPassword);
    return isMatch;
}

module.exports = {hashPassword,checkPassword}
