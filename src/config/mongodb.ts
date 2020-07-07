import * as mongoose from 'mongoose';
import {
  MONGO_URL
} from '../constants'

class MongoDatabase {
  constructor() {
    this.connect();
  }

  public connect(): void {
    mongoose.connect(MONGO_URL,  {useNewUrlParser: true}).then((connection) => {
      console.log("MongoDB database connnection established on", connection.connections[0].name)
    }).catch((err) => {
      console.log("Error connecting to database ", err)
    });
  }
}

export default MongoDatabase;
