import "dotenv/config";

import { MongoDBContainer } from "@testcontainers/mongodb";
import mongoose from "mongoose";
import { StartedMongoDBContainer } from "@testcontainers/mongodb";
import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
} from "testcontainers";

let mongoContainer: StartedMongoDBContainer;
let appContainer: StartedTestContainer;
let mongoUri: string;
let network: StartedNetwork;
let appUrl: string;

export const setupTestDatabase = async () => {
  network = await new Network().start();

  mongoContainer = await new MongoDBContainer("mongo:7")
    .withNetwork(network)
    .withNetworkAliases("mongo-test")
    .start();

  mongoUri = `mongodb://mongo-test:27017/default`;

  appContainer = await (
    await GenericContainer.fromDockerfile("./").build()
  )
    .withNetwork(network)
    .withExposedPorts(3000)
    .withEnvironment({
      PORT: "3000",
      MONGO_URI: mongoUri,
      JWT_SECRET: process.env.JWT_SECRET!,
      MAPS_API_KEY: process.env.MAPS_API_KEY!,
    })
    .withCopyFilesToContainer([{ source: ".env", target: ".env" }])
    .withNetworkAliases("app-test")
    .start();

  appUrl = `http://localhost:${appContainer.getMappedPort(3000)}`;

  return appUrl;
};

export const teardownTestDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoContainer) await mongoContainer.stop();

  if (appContainer) await appContainer.stop();

  if (network) await network.stop();
};
