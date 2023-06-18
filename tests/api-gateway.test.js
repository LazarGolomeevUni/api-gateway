const request = require('supertest');
const { app, server } = require('../index');



describe('API Gateway', () => {

  afterAll((done) => {
    server.close(done);
  });
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
