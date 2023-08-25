import { OPENAIAPI, TWITTER_PASSWORD, TWITTER_USERNAME } from '$/service/envValues';
// import { OpenAI } from 'langchain/llms/openai';
import { OpenAI } from 'openai';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';

const origin = 'https://twitter.com';
const web = 'http://localhost:3000/';

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

let browser1: Browser | null = null;
let context1: BrowserContext | null = null;
let page1: Page | null = null;

const getLoggedInPage1 = async () => {
  if (page1?.isClosed() === false) return page1;

  browser1 = await chromium.launch({ headless: false });
  context1 = await browser1.newContext({ locale: 'ja-JP' });
  page1 = await context1.newPage();

  await page1.goto(web);

  return page1;
};

const openai = new OpenAI({
  apiKey: OPENAIAPI,
});
const GPTA = async () => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: '簡単で面白いことを言ってください' }],
    model: 'gpt-3.5-turbo',
    max_tokens: 50,
  });

  const answerArray = completion.choices.map((choice) => choice.message.content);
  const filteredAnswerArray = answerArray.filter((content) => content !== null);
  const answer = filteredAnswerArray.join(' '); // 文字列を結合

  console.log(answer);
  return answer;
};

export const gptRepository = {
  fetchGPTA: async (): Promise<string[]> => {
    const contents = await GPTA();
    console.log('fetchGPTAが読み出されました。');
    // const contents = await runA();

    return [contents];
  },

  fetchGPTB: async (): Promise<string[]> => {
    const contents = await GPTA();

    console.log('fetchGPTBが読み出されました。');

    // const contents = await runB();

    return [contents];
  },

  fetchGPTC: async (): Promise<string[]> => {
    const contents = await GPTA();
    console.log('fetchGPTCが読み出されました。');

    // const contents = await runA();

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

  fetchPlayBrwser: async (): Promise<void> => {
    //ローカルホスト３０００番
    await getLoggedInPage1();
  },
};
