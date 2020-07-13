import { Application } from 'express';
import Routes from '../routes'

export default class {

  constructor(private app: Application) {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    new Routes(this.app);
  }
}

