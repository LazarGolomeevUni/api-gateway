const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  describe('GET api-gateway', () => {
    test('should get api-gateway', async () => {
      const response = await request(app)
        .get('/')
        .send();
      expect(response.status).toBe(200);
    });
  });
  describe('GET authentication', () => {
    test('should get authentication', async () => {
      const response = await request(app)
        .get('/')
        .send();
      expect(response.status).toBe(200);
    });
  });

});
