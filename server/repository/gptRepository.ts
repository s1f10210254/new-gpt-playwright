import { OPENAIAPI, TWITTER_PASSWORD, TWITTER_USERNAME } from '$/service/envValues';
import { ConversationChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';

// dotenv.config();
// const OPENAIAPI = process.env.OPENAI_API ?? '';

// const env = process.env;

// console.log('envファイル', env.OPENAI_API_KEY);

const llm = new OpenAI({
  openAIApiKey: OPENAIAPI,
});
const origin = 'https://twitter.com';

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

// const openai = new OpenAI({
//   apiKey: OPENAIAPI,
// });

// const GPTA = async () => {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: 'user', content: '簡単で面白いことを言ってください' }],
//     model: 'gpt-3.5-turbo',
//     max_tokens: 50,
//   });

//   const answerArray = completion.choices.map((choice) => choice.message.content);
//   const filteredAnswerArray = answerArray.filter((content) => content !== null);
//   const answer = filteredAnswerArray.join(' '); // 文字列を結合

//   console.log(answer);
//   return answer;
// };

// const getStockPrice = async () => {
//   const apiKey = 'L9ZH7B1TW75Z7VZE';
//   // const symbol = 'AAPL';
//   const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=USDJPY&interval=15min&apikey=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     const timeSeries = response.data['Time Series (15min)'];
//     const timestamps = Object.keys(timeSeries);
//     const latesttimestamps = timestamps.slice(0, 8);

//     const stockdata = latesttimestamps.map((timestamp) => ({
//       time: timestamp,
//       open: timeSeries[timestamp]['1. open'],
//       high: timeSeries[timestamp]['2. high'],
//       low: timeSeries[timestamp]['3. low'],
//       close: timeSeries[timestamp]['4. close'],
//     }));

//     return stockdata;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

export const character = `
あなたが先程購入した金額をxとします。xが2%減少した際には即売却するものとします。xが上昇している場合は下がるまでに到達した最大の額から2%減った際に売却するものとします。売却した日時を記録するようにしてください
`;

export const buy = `
現在のFXのレートがあるものとします。あなたは今50万円持っているものとし、そのお金でFX投資をするものとします。
`;

export const sell = `
売却した際の収支、日時を表示してください
`;

// const openai = axios.create({
//   baseURL: 'https://api.openai.com/v1',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${OPENAIAPI}`,
//   },
// });

export const run = async () => {
  // LLMの準備
  console.log('run関数が読み出されました');
  // const llm = new ChatOpenAI({ temperature: 0 });

  console.log('llm');
  // ConversationChainの準備
  // const chain = new ConversationChain({ llm });
  const chain = new ConversationChain({ llm });

  /*
  const kabuka = getStockPrice().then((stockData) => {
    console.log(stockData);
  }); //ここで直近２時間の株価表示、なんかAPI止まったから放置してる

  */
  // 会話の実行
  const input1 = buy; //例として直近２時間で一番安かったときのものを買うようにしてみてる
  const res1 = await chain.call({ input: input1 });
  console.log('Human:', input1);
  console.log('AI:', res1['response']);

  // 会話の実行
  const input2 = character; //戦略入力
  const res2 = await chain.call({ input: input2 });
  console.log('Human:', input2);
  console.log('AI:', res2['response']);

  // 会話の実行
  const input3 = sell; //売却、収支と日時出力
  const res3 = await chain.call({ input: input3 });
  console.log('Human:', input3);
  console.log('AI:', res3['response']);

  return res3['response'];
};

export const gptRepository = {
  fetchGPTA: async (): Promise<string[]> => {
    // const contents = await GPTA();
    console.log('fetchGPTAが読み出されました。');
    const contents = await run();

    return [contents];
  },

  fetchGPTB: async (): Promise<string[]> => {
    // const contents = await GPTA();

    console.log('fetchGPTBが読み出されました。');

    const contents = await run();

    return [contents];
  },

  fetchGPTC: async (): Promise<string[]> => {
    // const contents = await GPTA();
    console.log('fetchGPTCが読み出されました。');

    const contents = await run();

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
