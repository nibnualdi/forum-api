const ThreadTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const CreatedThread = require("../../../Domains/threads/entities/CreatedThread");

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      const createThread = {
        userId: 'secret_token',
        title: 'dicoding article',
        body: 'Lorem ipsum color sit amet'
      };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.addThread(createThread);

      const threadHelper = await ThreadTableTestHelper.findThreadById('thread-123');
      
      expect(threadHelper).toHaveLength(1);
      expect(threadHelper[0].id).toEqual('thread-123');
      expect(thread).toBeInstanceOf(CreatedThread);
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual(createThread.title);
      expect(thread.owner).toEqual(createThread.userId);
    });
  });

  describe('getThreadById function', () => {
    it('should throw not found error if thread id not found', async () => {
      const threadId = 'thread-notfound';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.getThreadById(threadId))
      .rejects.toThrow(NotFoundError);
    });

    it('should get thread by id', async () => {
      const fakeIdGenerator = () => '123';
      const threadId = `thread-${fakeIdGenerator()}`
      const createThread = {
        id: threadId,
        title: 'dicoding article',
        body: 'Lorem ipsum color sit amet',
        owner: 'user-123',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await ThreadTableTestHelper.addThread(createThread);

      const thread = await threadRepositoryPostgres.getThreadById(threadId);

      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual(createThread.title);
      expect(thread.owner).toEqual(createThread.owner);
    });
  });

  describe('getDetailThreadById function', () => {
    it('should throw not found error if thread id not found', async () => {
      const threadId = 'thread-notfound';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.getDetailThreadById(threadId))
      .rejects.toThrow(NotFoundError);
    });

    it('should get detail thread by id', async () => {
      const fakeIdGenerator = () => '123';
      const threadId = `thread-${fakeIdGenerator()}`;
      const createThread = {
        id: threadId,
        title: 'dicoding article',
        body: 'Lorem ipsum color sit amet',
        owner: 'user-123',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await ThreadTableTestHelper.addThread(createThread);

      const thread = await threadRepositoryPostgres.getDetailThreadById(threadId);

      expect(thread[0].id).toEqual('thread-123');
      expect(thread[0].title).toEqual(createThread.title);
      expect(thread[0].body).toEqual(createThread.body);
      expect(thread[0].username).toEqual(null);
      expect(thread[0].comment_id).toEqual(null);
      expect(thread[0].comment_username).toEqual(null);
      expect(thread[0].content).toEqual(null);
      expect(thread[0].comment_date).toEqual(null);
      expect(thread[0].is_delete).toEqual(null);
      expect(thread[0]).toHaveProperty('date');
      expect(thread[0].date).toBeInstanceOf(Object);
      expect(thread[0].date).toEqual(thread[0].date);
    });
  });
})