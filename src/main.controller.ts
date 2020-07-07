import { Application, Request, Response } from 'express';

export class Controller {

  constructor(private app: Application) {
    this.routes();
  }

  public routes(): void {
    this.app.get('/api', (req: Request, res: Response) => res.status(200).send({
      message: 'Welcome to the Kwik Help API!',
    }));

    this.app.get('/', (req: Request, res: Response) => res.status(200).send({
      message: 'Welcome to Kwik-Help!',
    }));
  }
}

export default Controller;
