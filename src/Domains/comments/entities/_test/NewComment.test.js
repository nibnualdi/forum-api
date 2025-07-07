const NewComment = require("../../../comments/entities/NewComment");

describe('NewComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {};

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload no meet data spesification', () => {
    const payload = {
      content: 123,
      threadId: 123,
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment entities correctly', () => {
    const payload = {
      content: 'comment thread',
      threadId: 'thread-123',
    };

    const newComment = new NewComment(payload);

    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
  });
})