class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const { threadId, commentId } = this._verifyPayload(useCasePayload);
    await this._commentRepository.getCommentById(commentId);
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.verifyOwner({ commentId: commentId, owner: userId });
    await this._commentRepository.deleteComment(commentId);
  }

  _verifyPayload(payload) {
    const { threadId, commentId } = payload;

    if (!threadId, !commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PAYLOAD');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    return { threadId, commentId }
  }
}

module.exports = DeleteCommentUseCase;
