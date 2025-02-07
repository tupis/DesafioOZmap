import { Router } from "express";
import { UserController } from "@http/controllers/UserController";

const userController = new UserController();
const router = Router();

router.get("/", (req, res) => {
  userController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  userController.getById(req, res);
});

router.delete("/:id", (req, res) => {
  userController.deleteById(req, res);
});

router.get("/email/:email", (req, res) => {
  userController.getByEmail(req, res);
});

export default router;
