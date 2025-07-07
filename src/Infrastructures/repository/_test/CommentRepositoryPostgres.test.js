const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const CreatedComment = require("../../../Domains/comments/entities/CreatedComment");

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment and return created comment correctly', async () => {
      const createComment = {
        userId: 'user-123',
        content: 'dicoding article comment',
        isDelete: false,
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const comment = await commentRepositoryPostgres.addComment(createComment);

      const commentHelper = await CommentsTableTestHelper.findCommentById(`comment-${fakeIdGenerator()}`);

      expect(commentHelper).toHaveLength(1);
      expect(commentHelper[0].id).toEqual(`comment-${fakeIdGenerator()}`);
      expect(comment).toBeInstanceOf(CreatedComment);
      expect(comment).toEqual(new CreatedComment({
        id: `comment-${fakeIdGenerator()}`, 
        content: createComment.content, 
        owner: createComment.userId, 
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment (update is_delete column to be true)', async () => {
      const fakeIdGenerator = () => '123';
      const commentId = `comment-${fakeIdGenerator()}`
      const createComment = {
        id: commentId,
        owner: 'user-123',
        content: 'dicoding article comment',
        isDelete: false,
        threadId: 'thread-123',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await CommentsTableTestHelper.addComment(createComment);

      await commentRepositoryPostgres.deleteComment(commentId);

      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentById function', () => {
    it('should throw not found error if comment not found', async () => {
      const payload = {
        commentId: 'comment-notfound'
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.getCommentById(payload))
      .rejects.toThrow(NotFoundError);
    });

    it('should get comment by id', async () => {
      const fakeIdGenerator = () => '123';
      const commentId = `comment-${fakeIdGenerator()}`
      const createComment = {
        id: commentId,
        owner: 'user-123',
        content: 'dicoding article comment',
        isDelete: false,
        threadId: 'thread-123',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await CommentsTableTestHelper.addComment(createComment);

      const comment = await commentRepositoryPostgres.getCommentById(commentId);
      
      expect(comment).toHaveLength(1);
      expect(comment[0].id).toEqual(commentId);
      expect(comment[0].content).toEqual(createComment.content);
      expect(comment[0].is_delete).toEqual(createComment.isDelete);
      expect(comment[0].owner).toEqual(createComment.owner);
    });
  });

  describe('verifyOwner function', () => {
    it('should throw authorization error if there is no row with given comment id and owner', async () => {
      const payload = {
        commentId: 'comment-notfound',
        owner: 'user-nottheowner'
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.verifyOwner(payload))
      .rejects.toThrow(AuthorizationError);
    });

    it('should verify ownership of comment', async () => {
      const fakeIdGenerator = () => '123';
      const commentId = `comment-${fakeIdGenerator()}`
      const createComment = {
        id: commentId,
        owner: 'user-123',
        content: 'dicoding article comment',
        isDelete: false,
        threadId: 'thread-123',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await CommentsTableTestHelper.addComment(createComment);

      await expect(commentRepositoryPostgres.verifyOwner({ commentId, owner: createComment.owner }))
      .resolves.not.toThrowError(AuthorizationError)
    });
  });
})