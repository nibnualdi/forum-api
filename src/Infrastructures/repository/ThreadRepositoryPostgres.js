const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(createThread) {
    const { userId, title, body } = createThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, userId],
    };

    const result = await this._pool.query(query);

    return new CreatedThread({ ...result.rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT id, title, owner FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    };
    
    return new CreatedThread({ ...result.rows[0] });
  }

  async getDetailThreadById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at AS date, ut.username, c.id AS comment_id, uc.username AS comment_username, c.created_at AS comment_date, c.content, c.is_delete 
      FROM threads t
      LEFT JOIN comments c ON t.id = c.thread_id
      LEFT JOIN users ut ON t.owner = ut.id
      LEFT JOIN users uc ON c.owner = uc.id
      WHERE t.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    };

    return result.rows;
  }
};

module.exports = ThreadRepositoryPostgres;
