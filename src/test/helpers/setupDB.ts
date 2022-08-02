import * as mongoose from 'mongoose';

const emptyAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  try {
    for (const name of collections) {
      const collection = mongoose.connection.collections[name];
      collection.deleteMany({});
    }
  } catch(err) {
    console.log({err});
  }
}

const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    const collection = mongoose.connection.collections[name];
    try {
      await collection.drop();
    } catch (error) {
      // This could be triggered when you try to drop a collection that's already dropped.
      if (error.message === "ns not found") return;

      console.log(error.message);
    }
  }
}

export default async (databaseName: string): Promise<void> => {
  // First establish a connection to Mongoose,
  // with a separate database per test file.
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1:27017/${databaseName}`
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    });
  });



  // So each test starts on clean slate
  afterEach(async () => {
    await emptyAllCollections();
  });

  // Disconnect Mongoose
  afterAll(async () => {
    await dropAllCollections();
    await mongoose.connection.close();
  });
}
