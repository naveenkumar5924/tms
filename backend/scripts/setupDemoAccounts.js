require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tms_test';

async function setup() {
  await mongoose.connect(uri);
  const hash = await bcrypt.hash('Passw0rd!', 10);

  // Set password for ALL users to Passw0rd!
  await mongoose.connection.collection('users').updateMany(
    {},
    { $set: { password: hash } }
  );

  const allUsers = await mongoose.connection.collection('users').find(
    {},
    { projection: { username: 1, email: 1, role: 1 } }
  ).toArray();

  console.log(JSON.stringify(allUsers, null, 2));
  await mongoose.disconnect();
}

setup().catch(console.error);
