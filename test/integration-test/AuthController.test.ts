import "dotenv/config";

import request from "supertest";
import { setupTestDatabase, teardownTestDatabase } from "../test-setup";

let app = `http://localhost:3000`;
const email = "teste@email.com";
const password = "123456";

describe("AuthController Integration Tests", () => {
  beforeAll(async () => {
    app = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("Deve registrar um usuário com sucesso", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email,
        password,
        name: "Tupi Henrique",
        coordinates: {
          latitude: -2.511923,
          longitude: -44.227153,
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("email", email);
  });

  it("Deve fazer login com sucesso", async () => {
    const response = await request(app).post("/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Deve falhar ao fazer login com credenciais erradas", async () => {
    const response = await request(app).post("/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
  });
});
