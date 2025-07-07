class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.content = payload.content;
  }

  _verifyPayload(payload) {
    const { content, threadId } = payload;

    if (!content || !threadId) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = NewComment;
