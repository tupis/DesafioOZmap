import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export const connectDatabase = async () => {
  await mongoose.connect(MONGO_URI);
};
