import * as mongoose from 'mongoose';
import {
  MONGO_URL
} from '../constants'

class MongoDatabase {
  constructor() {
    this.connect();
  }

  public connect(): void {
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }).then(() => {
      console.log("MongoDB database connnection established");
    }).catch((err) => {
      console.log("Error connecting to database ", err)
    });
  }
}

export default MongoDatabase;
