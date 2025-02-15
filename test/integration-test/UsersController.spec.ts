import "dotenv/config";
import request from "supertest";
import { setupTestDatabase, teardownTestDatabase } from "../test-setup";

let app = `http://localhost:3000`;
let accessToken: string;
let createdUserId: string;

const user = {
  email: "testuser@email.com",
  password: "123456",
  name: "Test User",
};

beforeAll(async () => {
  app = await setupTestDatabase();

  const authResponse = await request(app)
    .post("/auth/register")
    .send({
      ...user,
      coordinates: {
        latitude: -2.511923,
        longitude: -44.227153,
      },
    });

  expect(authResponse.status).toBe(201);
  expect(authResponse.body).toHaveProperty("token");
  accessToken = authResponse.body.token;
  createdUserId = authResponse.body.user._id;
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe("UserController Integration Tests", () => {
  it("Deve listar todos os usuários", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Deve buscar um usuário por ID", async () => {
    const response = await request(app)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email", user.email);
  });

  it("Deve atualizar um usuário com sucesso", async () => {
    const response = await request(app)
      .put(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Test User",
        password: "newpassword123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Updated Test User");
  });

  it("Deve deletar um usuário", async () => {
    const response = await request(app)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(204);

    const findUserResponse = await request(app)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(findUserResponse.status).toBe(404);
  });
});
