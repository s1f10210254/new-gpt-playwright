import { gptUseCase } from '$/useCase/gptUseCase';
import { defineController } from './$relay';

export default defineController(() => ({
  get: () => gptUseCase.fetchPlayBrwser().then((browser) => ({ status: 200, body: browser })),
}));
