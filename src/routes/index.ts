import { Application, Request, Response } from 'express';

import apiV1Router from './apiV1';

class Routes {
  constructor(private app: Application) {
    this.configureRoutes();
  }

  public configureRoutes(): void {
    // handle API routes for version 1
    this.app.use('/api/v1', apiV1Router)

    // Edit this line when there is a new version so it would
    // always default to latest released API for /api path
    this.app.use('/api', apiV1Router)

    //catch all undefined routes
    this.app.use('*', (req: Request, res: Response) => res.status(404).send({
      object: 'error',
      message: 'Path does not exist',
    }));
  }
}

export default Routes;
