import * as mongoose from 'mongoose';
import * as Confirm from 'prompt-confirm';
import 'dotenv/config'

import * as users from './users.json'
import User from '../src/models/User';

const verifyOperation = () => {
  console.log('This operatiion would add new seed data in the database based on the user seed file at seeds/users.json');
  console.log('If they already exist, they would be updated.');

  new Confirm("Do you want to proceed? (Y/N)")
    .ask((yes) => {
      if (yes) {
        seedDB();
      } else {
        console.log('Noted. Exiting...');
        process.exit(0);
      }
    });
}

const verifyDevEnv = () => {
  const env = process.env.NODE_ENV || 'development';

  console.log('Environment:', env);

  if (env != 'development') {
    console.log(`It has been detected that your current environment is ${env}. This is meant to be used only on development`);
    console.log('Exiting...');
    process.exit(1);
  }
}

const verifyMongoDbUrl = () =>  {
  if (!process.env.MONGO_URL) {
    console.log("No MONGODB_URL variable set. This is needed to proceed. Please see the .sample.env file as a guide for creating your .env file");
    process.exit(1);
  }
}

const connectMongoDB = async () => {
  verifyMongoDbUrl();

  console.log('Connecting to', process.env.MONGO_URL);

  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('MongoDB database connnection established')
    console.log(`Connected to: ${mongoose.connection.db.databaseName}`);
  }).catch((err) => {
    console.log("Error connecting to database ", err);
    process.exit(1);
  });
}

const createDefaultUsers = async () => {
  for (const userIndex in users) {
    const update = users[userIndex];
    const query = { email: update.email };

    console.log(`creating ${update.username}...`)

    const options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };

    await User.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;

        console.log(`${result.username} seeded`);
    });
  }
}

const disconnectMongoDB = async () => {
  await mongoose.connection.close();
  console.log('Disconected from MongoDB.')
  console.log('Exiting...')
}


const seedDB = async () => {
  verifyDevEnv();
  await connectMongoDB();
  await createDefaultUsers();
  await disconnectMongoDB();
  process.exit(0);
}

verifyOperation();
