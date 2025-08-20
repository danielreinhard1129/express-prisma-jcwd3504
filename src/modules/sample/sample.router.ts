import { Router } from "express";
import { SampleController } from "./sample.controller";
import {
  validateCreateSample,
  validateSendEmail,
} from "../../validators/sample.validator";
import { UploadMiddleware } from "../../middlewares/uploader.middleware";

export class SampleRouter {
  private router: Router;
  private sampleController: SampleController;
  private uploaderMiddleware: UploadMiddleware;

  constructor() {
    this.router = Router();
    this.sampleController = new SampleController();
    this.uploaderMiddleware = new UploadMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.get("/", this.sampleController.getSamples);
    this.router.get("/:id", this.sampleController.getSample);
    this.router.post(
      "/",
      validateCreateSample, // validator
      this.sampleController.createSample
    );
    this.router.post(
      "/send-email",
      validateSendEmail, // validator
      this.sampleController.sendEmail
    );
    this.router.post(
      "/upload",
      this.uploaderMiddleware.upload().fields([{ name: "image", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter(["image/jpeg", "image/png"]),
      this.sampleController.uploadImage
    );
  };

  getRouter = () => {
    return this.router;
  };
}
