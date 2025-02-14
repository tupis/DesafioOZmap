import "dotenv/config";
import request from "supertest";
import { setupTestDatabase, teardownTestDatabase } from "../test-setup";

let app = `http://localhost:3000`;
let accessToken: string;
let createdRegionId: string;

beforeAll(async () => {
  app = await setupTestDatabase();

  // Criar usuário e obter token de autenticação
  const authResponse = await request(app)
    .post("/auth/register")
    .send({
      email: "example@email.com",
      password: "123457",
      name: "Tupi Henrique",
      coordinates: {
        latitude: -2.511923,
        longitude: -44.227153,
      },
    });

  expect(authResponse.status).toBe(201);
  expect(authResponse.body).toHaveProperty("token");
  accessToken = authResponse.body.token;
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe("RegionController Integration Tests", () => {
  it("Deve criar uma nova região com sucesso", async () => {
    const response = await request(app)
      .post("/regions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        location: {
          type: "Polygon",
          coordinates: [
            [
              [-44.227153, -2.511923],
              [-44.228153, -2.512923],
              [-44.229153, -2.513923],
              [-44.227153, -2.511923],
            ],
          ],
        },
        name: "Região Teste",
        observation: "Região teste para validar API",
        userId: "65abcde1234567890abcdef1",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    createdRegionId = response.body._id;
  });

  it("Deve listar todas as regiões cadastradas", async () => {
    const response = await request(app)
      .get("/regions")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Deve buscar uma região por ID", async () => {
    const response = await request(app)
      .get(`/regions/${createdRegionId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Região Teste");
  });

  it("Deve retornar erro ao buscar uma região com ID inexistente", async () => {
    const response = await request(app)
      .get("/regions/65ff00000000000000000000")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it("Deve atualizar uma região com sucesso", async () => {
    const response = await request(app)
      .put(`/regions/${createdRegionId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        location: {
          type: "Polygon",
          coordinates: [
            [
              [-44.227153, -2.511923],
              [-44.228153, -2.512923],
              [-44.229153, -2.513923],
              [-44.227153, -2.511923],
            ],
          ],
        },
        name: "Região Atualizada",
        observation: "Região modificada",
        userId: "65abcde1234567890abcdef1",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Região Atualizada");
  });

  it("Deve buscar regiões que contenham um ponto específico", async () => {
    const response = await request(app)
      .post("/regions/find-regions-containing-point")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        latitude: -2.511923,
        longitude: -44.227153,
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Deve buscar regiões próximas a um ponto", async () => {
    const response = await request(app)
      .post("/regions/find-regions-near-point")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        latitude: -2.511923,
        longitude: -44.227153,
        maxDistance: 5000,
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
