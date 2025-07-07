const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 400 if content empty', async () => {
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

      const commentPayload = {}
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 400 if content not string', async () => {
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

      const commentPayload = {
        content: 123,
      }
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar dan accessToken harus string');
    });

    it('should response 401 if authorization accessToken empty', async () => {
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

      const commentPayload = {
        content: 'threadds comment',
      }
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if thread id not found', async () => {
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

      const commentPayload = {
        content: 'threadds comment',
      }
      const threadId = 'thread-empty';
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 201 and persisted comment', async () => {
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

      const commentPayload = {
        content: 'threadds comment',
      }
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.content).toEqual(commentPayload.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 if authorization accessToken empty', async () => {
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

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,

      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if comment not found', async () => {
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

      const commentId = 'comment-notfound';

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if thread not found', async () => {
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
      const threadId = 'thread-notfound'

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

      const commentId = 'comment_notfound'

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 403 if comment id and owner id not matched', async () => {
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
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding2',
          password: 'secret',
          fullname: 'Dicoding Indonesia 2',
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
      const loginResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding2',
          password: 'secret',
        },
      });
      const { data: { accessToken: accessToken2 } } = JSON.parse(loginResponse2.payload);
      
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

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken2}`
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });
    
    it('should response 200 and soft delte', async () => {
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

      // delete comment
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
      });

      const getCommentDeleted = await CommentsTableTestHelper.findCommentById(commentId);
      
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(getCommentDeleted[0].is_delete).toEqual(true);
    });
  })
})