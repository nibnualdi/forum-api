const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.getThreadById(useCasePayload.threadId);
    const payload = {
      userId,
      threadId: newComment.threadId,
      content: newComment.content,
    }
    return this._commentRepository.addComment(payload);
  }
};

module.exports = AddCommentUseCase;
