const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should throw error if use case payload not contain title and body', async () => {
    const userId = 'user-123';
    const useCasePayload = {};
    const addThreadUseCase = new AddThreadUseCase({});

    await expect(addThreadUseCase.execute(userId, useCasePayload))
    .rejects
    .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const userId = 'user-123'
    const useCasePayload = {
      title: 'new thread',
      body: 'Lorem Ipsum',
    };
    const mockCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'dicoding',
    });
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'dicoding',
    })));

    // Create the use case instace
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
    
    // Action
    const actionAddThreadUseCase = await addThreadUseCase.execute(userId, useCasePayload);

    expect(actionAddThreadUseCase).toStrictEqual(mockCreatedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith({ userId, ...useCasePayload });
  });
});
