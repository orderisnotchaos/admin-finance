const dotenv = require('dotenv');

dotenv.config();

process.env.TOKEN_SECRET = require('crypto').randomBytes(64).toString('hex');

console.log(process.env.TOKEN_SECRET);