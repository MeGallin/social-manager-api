const app = require('../server');
const request = require('supertest');
const User = require('../models/UserModel');

describe('Register function', () => {
  afterEach(async () => {
    // Clean up created test data
    await User.deleteMany();
  });
  it('should create a new user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/v1/register')
      .send(userData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(userData.name);
    expect(res.body.data.user.email).toBe(userData.email);

    const createdUser = await User.findOne({ email: userData.email });
    expect(createdUser).not.toBeNull();
    expect(createdUser.password).not.toBe(userData.password);
    expect(createdUser.password.length).toBeGreaterThan(12);
  });
});
