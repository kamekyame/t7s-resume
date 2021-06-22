import { config, connectStream, getBearerToken, pathResolver } from "./deps.ts";

const resolve = pathResolver(import.meta);

import { option, ResumeRetweet } from "./retweet-bot.ts";

const env = config({
  path: resolve("./.env"),
  safe: true,
  example: resolve("./.env.example"),
});

const auth = {
  consumerKey: env["API_KEY"],
  consumerSecret: env["API_SECRETKEY"],
  token: env["TOKEN"],
  tokenSecret: env["TOKEN_SECRET"],
};

const bearerToken = await getBearerToken(auth.consumerKey, auth.consumerSecret);

const resumeRetweet = new ResumeRetweet(auth, bearerToken);
await resumeRetweet.checkRule();

//const res = JSON.parse(Deno.readTextFileSync("./sample/res0.json"));
//resumeRetweet.callback(res);
connectStream(
  bearerToken,
  (res) => {
    resumeRetweet.callback(res);
  },
  option,
);
