const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'comment thread',
    };

    const mockCreatedComment = new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });
    const mockCreatedThread = new CreatedThread({
      id: useCasePayload.threadId,
      title: 'title',
      owner: 'user-123',
    });
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(new CreatedThread({
      id: useCasePayload.threadId,
      title: 'title',
      owner: 'user-123',
    })));
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    })));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const actionAddCommentUseCase = await addCommentUseCase.execute(mockCreatedComment.owner, useCasePayload);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockCreatedThread.id);
    expect(actionAddCommentUseCase).toStrictEqual(mockCreatedComment);
  });
});