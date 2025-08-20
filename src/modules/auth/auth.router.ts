import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post("/forgot-password", this.authController.forgotPassword);
  };

  getRouter = () => {
    return this.router;
  };
}
