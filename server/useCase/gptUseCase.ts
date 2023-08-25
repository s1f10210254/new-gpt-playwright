import { gptRepository } from '$/repository/gptRepository';

export const gptUseCase = {
  fetchGPTA: async () => {
    const GPTA = await gptRepository.fetchGPTA();

    return GPTA;
  },

  fetchGPTB: async () => {
    const GPTB = await gptRepository.fetchGPTB();

    return GPTB;
  },

  fetchGPTC: async () => {
    const GPTC = await gptRepository.fetchGPTC();

    return GPTC;
  },

  fetchGptTweet: async (message: string) => {
    const tweet = await gptRepository.fetchGPTTweet(message);

    return tweet;
  },

  fetchPlayBrwser: async () => {
    const PlayBrwser = await gptRepository.fetchPlayBrwser();

    return PlayBrwser;
  },
};
