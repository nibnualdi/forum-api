const ThreadTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const pool = require("../../database/postgres/pool");
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 400 if title or body empty', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      
      const requestPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 400 if title or body not string', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      
      const requestPayload = {
        title: 123,
        body: 123,
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 if authorization accessToken empty', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'title',
        body: 'body',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      
      const requestPayload = {
        title: 'artikel dicoding',
        body: 'Lorem ipsum color sit amet.',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    })
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return detail thread', async () => {
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken, refreshToken } } = JSON.parse(loginResponse.payload);
      
      const threadPayload = {
        title: 'artikel dicoding',
        body: 'Lorem ipsum color sit amet.',
      };

      // add thread
      const addThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(addThread.payload);

      // addComment
      const commentPayload = {
        content: 'threads comment'
      }
      const addComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });

      const { data: { addedComment: { id: commentId } } } = JSON.parse(addComment.payload);
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });

      await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'John',
          password: 'secret',
          fullname: 'John Qwerty',
        },
      });
      // login user
      const loginResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'John',
          password: 'secret',
        },
      });
      const { data: { accessToken: accessToken2 } } = JSON.parse(loginResponse2.payload);
      const commentPayload2 = {
        content: 'Woaahhhhhh... nice thread'
      }
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload2,
        headers: {
          authorization: `Bearer ${accessToken2}`
        },
      });

      // get detail thread
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toHaveProperty('id');
      expect(responseJson.data.thread).toHaveProperty('title');
      expect(responseJson.data.thread).toHaveProperty('body');
      expect(responseJson.data.thread).toHaveProperty('date');
      expect(responseJson.data.thread).toHaveProperty('username');
      expect(responseJson.data.thread).toHaveProperty('comments');
    })
  })
})