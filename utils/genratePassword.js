const crypto = require('crypto');

const generateReadablePassword = (fullName = '') => {
  const namePart = fullName.split(' ')[0].toLowerCase().slice(0, 4); // first 4 letters of first name
  const randomPart = crypto.randomBytes(2).toString('hex'); // 4 random characters
  const symbols = '!@#%&';
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const number = Math.floor(Math.random() * 90 + 10); // 2-digit number

  return `${namePart}${number}${symbol}${randomPart}`; 
};

module.exports = generateReadablePassword;