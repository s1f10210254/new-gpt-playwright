import { TWITTER_PASSWORD, TWITTER_USERNAME } from '$/service/envValues';
import axios from 'axios';
import { ConversationChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';

const origin = 'https://twitter.com';

const llm = new OpenAI({
  openAIApiKey: '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',
  temperature: 0,
});

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

const getLoggedInPage = async () => {
  if (page?.isClosed() === false) return page;

  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({ locale: 'ja-JP' });
  page = await context.newPage();

  await page.goto(origin);
  await page.getByTestId('loginButton').click();
  await page.locator('input[autocomplete="username"]').fill(TWITTER_USERNAME);
  await page.getByText('次へ').click();
  await page.locator('input[name="password"]').fill(TWITTER_PASSWORD);
  await page.getByTestId('LoginForm_Login_Button').click();
  await page.getByTestId('SideNav_NewTweet_Button').waitFor();

  return page;
};

/*
const GPTA = async () => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: '簡単で面白いことを言ってください' }],
    model: 'gpt-3.5-turbo',
    max_tokens: 50,
  });

//   const answerArray = completion.choices.map((choice) => choice.message.content);
//   const filteredAnswerArray = answerArray.filter((content) => content !== null);
//   const answer = filteredAnswerArray.join(' '); // 文字列を結合

  console.log(answer);
  return answer;
};
*/

interface Price {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

const getStockPrice = async () => {
  const apiKey = 'L9ZH7B1TW75Z7VZE'; // Alpha VantageのAPIキーに置き換えてください
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=USDJPY&interval=60min&apikey=${apiKey}`;

  const response = await axios.get(url);
  const timeSeries = response.data['Time Series (60min)'];
  const timestamps = Object.keys(timeSeries);
  const latesttimestamps = timestamps.slice(0, 24);

  // Create an object to store all prices
  const prices: Record<string, Price> = {};

  latesttimestamps.forEach((timestamp) => {
    prices[timestamp] = {
      time: timestamp,
      open: timeSeries[timestamp]['1. open'],
      high: timeSeries[timestamp]['2. high'],
      low: timeSeries[timestamp]['3. low'],
      close: timeSeries[timestamp]['4. close'],
    };
  });

  // Return the prices object instead of array
  return prices;
};

export const character = `
あなたが先程購入したものの日時と購入した数を明記してください
`;

export const buyA = `
取得した24時間の中で最も安い株を購入してください。

制約条件
* あなたの所持金は50万円です。
* 購入する際、一回で全ての額を使い切らずに幾つかに分割するようにしてください
`;

export const buyB = `
取得した24時間の中でランダムな株を購入してください。

制約条件
* あなたの所持金は50万円です。
`;

export const sell = `
売却した際の収支、日時を表示してください
`;

export const runA = async () => {
  // LLMの準備
  // const llm = new OpenAI({ temperature: 0 });

  // ConversationChainの準備
  const chain = new ConversationChain({ llm });
  const fxprice = getStockPrice();

  // 会話の実行
  const input1 = `${JSON.stringify(
    fxprice,
    null,
    2
  )}は直近24時間の証券取引所の価格データです。${buyA}`;
  const res1 = chain.call({ input: input1 });
  console.log('lim1が読み込まれた');
  console.log('Human:', input1);
  console.log('AI:', res1);

  // 会話の実行
  const input2 = character; //戦略入力
  const res2 = await chain.call({ input: input2 });
  console.log('Human:', input2);
  console.log('AI:', res2['response']);

  // 会話の実行
  const input3 = sell; //売却、収支と日時出力
  const res3 = await chain.call({ input: input3 });
  console.log('Human:', input3);
  console.log('AI:', res3);
  return res3['response'];
};

export const runB = async (): Promise<string> => {
  // LLMの準備
  // const llm = new OpenAI({ temperature: 0 });

  // ConversationChainの準備
  const chain = new ConversationChain({ llm });

  const fxprice = await getStockPrice();

  // 会話の実行
  const input1 = `${JSON.stringify(
    fxprice,
    null,
    2
  )}は直近24時間の証券取引所の価格データです。${buyB}`;
  const res1 = await chain.call({ input: input1 });
  console.log('Human:', input1);
  console.log('AI:', res1);

  // 会話の実行
  const input2 = character; //戦略入力
  const res2 = await chain.call({ input: input2 });
  console.log('Human:', input2);
  console.log('AI:', res2['response']);

  // 会話の実行
  const input3 = sell; //売却、収支と日時出力
  const res3 = await chain.call({ input: input3 });
  console.log('Human:', input3);
  console.log('AI:', res3);
  return res3['response'];
};

export const runC = async (): Promise<string> => {
  // LLMの準備
  // const llm = new OpenAI({ temperature: 0 });

  // ConversationChainの準備
  const chain = new ConversationChain({ llm });

  // 会話の実行
  const input1 = `${runA}で求めた収支と${runB}で求めた収支を合わせて合計の収支を求めてください`;
  const res1 = await chain.call({ input: input1 });
  console.log('total:', res1['response']);
  return res1['response'];
};

export const gptRepository = {
  fetchGPTA: async (): Promise<string[]> => {
    //const contents = await GPTA();
    console.log('fetchGPTAが読み出されました。');
    const contents = await runA();

    return [contents];
  },

  fetchGPTB: async (): Promise<string[]> => {
    //const contents = await GPTA();

    console.log('fetchGPTBが読み出されました。');

    const contents = await runB();

    return [contents];
  },

  fetchGPTC: async (): Promise<string[]> => {
    // const contents = await GPTA();
    // const contents = await GPTA();
    console.log('fetchGPTCが読み出されました。');

    const contents = await runC();

    return [contents];
  },

  fetchGPTTweet: async (query: string): Promise<string> => {
    const page = await getLoggedInPage();

    await page.goto(`${origin}/home`);

    const tweetTextBox = await page.getByRole('textbox', { name: 'Tweet text' });
    await tweetTextBox.click();

    // const contents = 'aaa';
    const contents = query;

    await tweetTextBox.fill(contents);

    await page.getByTestId('tweetButtonInline').click();

    return contents;
  },
};
