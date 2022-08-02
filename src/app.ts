import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

import Controller from './controllers';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeConfig();
    this.initializeControllers();
  }

  private initializeConfig() {
    // Set morgan to log requests on dev environment
    this.app.use(logger('dev'));

    // Allows us to receive requests with data in json
    // and x-www-form-urlencoded formats
    this.app.use(bodyParser.json({ limit: '20mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '20mb', extended:true}));

    // Enables Cross-origin requests to server
    const corsOptions = {
      allowedHeaders: ['Content-Type']
    };
    this.app.use(cors(corsOptions));
  }

  private initializeControllers() {
    new Controller(this.app);
  }
}

export default new App().app;
