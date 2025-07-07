const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload no meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234,
      title: true,
      body: 123,
      date: 1234,
      username: true,
      comments: [
        {
          id: 123,
          username: true,
          date: 123,
          content: true,
        },
      ],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread dicoding',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
    expect(detailThread.comments[0].id).toEqual(payload.comments[0].id);
    expect(detailThread.comments[0].username).toEqual(payload.comments[0].username);
    expect(detailThread.comments[0].date).toEqual(payload.comments[0].date);
    expect(detailThread.comments[0].content).toEqual(payload.comments[0].content);
  });
});
