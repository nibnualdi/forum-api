const NewThread = require("../../Domains/threads/entities/NewThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread({ userId, title: newThread.title, body: newThread.body });
  }
}

module.exports = AddThreadUseCase;
