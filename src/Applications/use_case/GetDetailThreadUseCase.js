const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const result = await this._threadRepository.getDetailThreadById(useCasePayload.threadId);
    const rows = result.reduce((acc, row) => {
      if (!acc) {
        // eslint-disable-next-line no-param-reassign
        acc = {
          id: row.id,
          title: row.title,
          body: row.body,
          date: row.date.toISOString(),
          username: row.username,
          comments: [],
        };
      }

      acc.comments.push({
        id: row.comment_id,
        username: row.comment_username,
        date: row.comment_date.toISOString(),
        content: row.is_delete ? '**komentar telah dihapus**' : row.content,
      });

      return acc;
    }, null);
    
    return new DetailThread({ ...rows });
  }

  _verifyPayload(payload) { 
    const { threadId } = payload;
    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PAYLOAD');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = GetDetailThreadUseCase;
