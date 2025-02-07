import { Router } from "express";
import { AuthController } from "@http/controllers/AuthController";
import { validationMiddlewareDto } from "@shared/middleware/validation";
import { RegisterUserDto } from "@modules/user/dto/register-user.dto";
import { LoginUserDto } from "@modules/user/dto/login-user.dto";

const authController = new AuthController();
const router = Router();

router.post(
  "/register",
  validationMiddlewareDto(RegisterUserDto),
  (req, res) => {
    authController.register(req, res);
  },
);
router.post("/login", validationMiddlewareDto(LoginUserDto), (req, res) => {
  authController.login(req, res);
});

export default router;
