const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain thread id, comment id', async () => {
    const userId = 'user-123';
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
    .rejects
    .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PAYLOAD');
  });

  it('should throw error if use case payload no meet data spesification', async () => {
    const userId = 'user-123';
    const useCasePayload = {
      threadId: 123,
      commentId: 123,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
    .rejects
    .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const userId = 'user-123';
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const mockCreatedThread = new CreatedThread({
      id: useCasePayload.threadId,
      title: 'title',
      owner: 'user-123',
    });
    const mockGetDetailCommentById = [
      {
        id: useCasePayload.commentId, 
        content: 'sebuah content', 
        is_delete: false, 
        owner: 'user-456'
      }
    ]
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetDetailCommentById));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new CreatedThread({
        id: useCasePayload.threadId,
        title: 'title',
        owner: 'user-123',
      })));
    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute(userId, useCasePayload);

    expect(mockCommentRepository.getCommentById).toBeCalledWith(useCasePayload.commentId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockCreatedThread.id);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith({ commentId: useCasePayload.commentId, owner: mockCreatedThread.owner });
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.commentId);
  })
})