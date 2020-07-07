import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import Controller from './main.controller';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeConfig();
    this.initializeController();
  }

  private initializeConfig() {
    // Allows us to receive requests with data in json
    // and x-www-form-urlencoded formats
    this.app.use(bodyParser.json({ limit: '20mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '20mb', extended:true}));

    // Enables Cross-origin requests to server
    this.app.use(cors());
  }

  private initializeController() {
    new Controller(this.app);
  }
}

export default new App().app;
