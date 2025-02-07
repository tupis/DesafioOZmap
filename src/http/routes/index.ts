import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";

export const AppRouter = Router();

AppRouter.use("/users", userRoutes);

export const PublicRouter = Router();

PublicRouter.use("/auth", authRoutes);
