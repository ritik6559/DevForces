const request = require("supertest");
const app = require("./app");

describe("Auth API", () => {
  describe("POST /auth/register", () => {
    test("registers a new user and returns 201", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "alice@example.com", password: "secret123" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe("alice@example.com");
    });

    test("rejects missing fields with 400", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "x@example.com" });
      expect(res.status).toBe(400);
    });

    test("rejects duplicate email with 409", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "dup@example.com", password: "pw" });
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "dup@example.com", password: "pw" });
      expect(res.status).toBe(409);
    });
  });

  describe("POST /auth/login", () => {
    test("logs in with correct credentials and returns a token", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "bob@example.com", password: "hunter2" });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "bob@example.com", password: "hunter2" });
      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe("string");
    });

    test("rejects wrong password with 401", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "carol@example.com", password: "rightpw" });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "carol@example.com", password: "wrongpw" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    test("returns the authenticated user with a valid token", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "dave@example.com", password: "pw" });
      const login = await request(app)
        .post("/auth/login")
        .send({ email: "dave@example.com", password: "pw" });
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${login.body.token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe("dave@example.com");
    });

    test("rejects requests without a token with 401", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
