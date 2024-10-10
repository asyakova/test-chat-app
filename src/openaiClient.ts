import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: 'KEY_HERE',
    dangerouslyAllowBrowser: true,
});

export default openai;
