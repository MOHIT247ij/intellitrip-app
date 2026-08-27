/**
 * auth.test.js
 * -----------------------------------------------------------------
 * Integration-style tests for the auth flow using supertest against
 * the Express app. These require a reachable MySQL database (the
 * same one configured in backend/.env) since they exercise Prisma.
 * Skipped automatically when DATABASE_URL is not set, so `npm test`
 * still runs the pure-logic suites (expense, itinerary schema) in
 * environments without a database configured.
 * -----------------------------------------------------------------
 */
const request = require('supertest');

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('Auth API', () => {
  let app;
  let prisma;
  const testEmail = `jest_${Date.now()}@intellitrip.test`;

  beforeAll(() => {
    app = require('../src/app');
    prisma = require('../src/config/prisma');
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('registers a new user and returns a dev OTP', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Jest Test User',
      email: testEmail,
      mobile: String(9000000000 + Math.floor(Math.random() * 999999)),
      password: 'Passw0rd1',
      confirmPassword: 'Passw0rd1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('rejects registration with mismatched passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Jest Test User 2',
      email: `mismatch_${Date.now()}@intellitrip.test`,
      mobile: '9123456780',
      password: 'Passw0rd1',
      confirmPassword: 'Different1',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects login with wrong credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: testEmail, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects protected route access without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
