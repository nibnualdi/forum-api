const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetDetailThread', () => {
  it('should throw error if use case payload not contain thread id', async () => {
    const useCasePayload = {};
    const getDetailThread = new GetDetailThreadUseCase({});

    await expect(getDetailThread.execute(useCasePayload))
    .rejects
    .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PAYLOAD');
  });

  it('should throw error if use case payload no meet data spesification', async () => {
    const useCasePayload = {
      threadId: 123,
    };
    const getDetailThread = new GetDetailThreadUseCase({});

    await expect(getDetailThread.execute(useCasePayload))
    .rejects
    .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get detail thread and convert data from raw to aggregate action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment'
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**'
        }
      ]
    });
    const mockRawDetailThread = [
      {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date('2021-08-08T07:19:09.775Z'),
        username: 'dicoding',
        comment_id: 'comment-_pby2_tmXV6bcvcdev8xk',
        comment_username: 'johndoe',
        comment_date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date('2021-08-08T07:19:09.775Z'),
        username: 'dicoding',
        comment_id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        comment_username: 'dicoding',
        comment_date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'komen dari dicoding',
        is_delete: true,
      },
    ]
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getDetailThreadById = jest.fn()
    .mockImplementation(() => Promise.resolve(mockRawDetailThread));

    const getDetailThread = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const actionGetDetailThreadUseCase = await getDetailThread.execute(useCasePayload);

    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(actionGetDetailThreadUseCase).toEqual(mockDetailThread);
  });
})