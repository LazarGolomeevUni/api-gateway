const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  describe('POST /register', () => {
    test('should register a new user using the authentication service', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
        age: 25,
        field: 'testfield',
        consent: 1
      };

      const response = await request(app)
        .post('/authentication/register')
        .send(newUser);

      expect(response.status).toBe(201);
    });

    test('should return 500 status if there is an error during registration', async () => {
      const newUser = {
        // Invalid user data that may cause an error during registration
        username: 'testuser',
        password: 'testpassword',
        age: "garfield",
        consent: 1
      };

      const response = await request(app)
        .post('/authentication/register')
        .send(newUser);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    test('should log in a user using the authentication service', async () => {
      const userCredentials = {
        username: 'Maya',
        password: 'great'
      };

      const response = await request(app)
        .post('/authentication/login')
        .send(userCredentials);

      expect(response.status).toBe(200);
    });

    test('should return 400 status if the user is not found', async () => {
      const userCredentials = {
        username: 'nonexistentuser',
        password: 'testpassword'
      };

      const response = await request(app)
        .post('/authentication/login')
        .send(userCredentials);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Cannot find the user');
    });

    test('should return 500 status if there is an error during login', async () => {
      const userCredentials = {
        username: 'testuser',
        password: 'invalidpassword'
      };

      const response = await request(app)
        .post('/authentication/login')
        .send(userCredentials);

      expect(response.status).toBe(500);
      expect(response.text).toBe('oops');
    });
  });

  describe('POST /posts', () => {
    test('should create a new post using the posts service', async () => {
      const userCredentials = {
        username: 'Maya',
        password: 'great'
      };

      // Perform the login request and obtain the access token
      const logInResponse = await request(app)
        .post('/authentication/login')
        .send(userCredentials);

      const accessToken = logInResponse.body.accessToken;

      const post = {
        projectId: 1
      };

      // Mock the authentication middleware to provide the user object
      const authenticateToken = jest.fn((req, res, next) => {
        // Set the user object from the login response
        req.user = logInResponse.body.user;
        next();
      });

      // Mock the authentication middleware for the posts route
      app.use('/posts', authenticateToken);

      // Send a POST request to the API gateway
      const response = await request(app)
        .post('/posts/messaging')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(post);

      expect(response.status).toBe(201);
    });

    test('should return 500 status if there is an error during post creation', async () => {
      // Mock the posts service to throw an error during post creation
      const userCredentials = {
        username: 'Maya',
        password: 'great'
      };

      // Perform the login request and obtain the access token
      const logInResponse = await request(app)
        .post('/authentication/login')
        .send(userCredentials);

      const accessToken = logInResponse.body.accessToken;

      const post = {
        projectId: 'wazzaa'
      };

      // Mock the authentication middleware to provide the user object
      const authenticateToken = jest.fn((req, res, next) => {
        // Set the user object from the login response
        req.user = logInResponse.body.user;
        next();
      });

      // Mock the authentication middleware for the posts route
      app.use('/posts', authenticateToken);

      // Send a POST request to the API gateway
      const response = await request(app)
        .post('/posts/messaging')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(post);

      expect(response.status).toBe(500);

    }, 30000);
  });
});
