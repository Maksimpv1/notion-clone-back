import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  OPEN_AI_KEY: string;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>(
);

app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);

app.post('/translateDocument', async (c) => {
  const { documentData, targetLang } = await c.req.json();
  console.log("Received Data:", { documentData, targetLang });

  const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
    input_text: documentData,
    max_length: 1000,
  });
  console.log("Summary Response:", summaryResponse);

  const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
    text: summaryResponse.summary,
    source_lang: 'english',
    target_lang: targetLang,
  });
  console.log("Translation Response:", response);
  return c.json(response);
});

app.get('/hello', (c) => {
	const name= c.req.param('name');
	return c.text(`hello, ${name}`)
})

export default app;