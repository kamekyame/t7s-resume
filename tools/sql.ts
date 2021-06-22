import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Client } from "https://deno.land/x/mysql/mod.ts";

import { pathResolver } from "https://kamekyame.github.io/deno_tools/path/mod.ts";
const resolve = pathResolver(import.meta);

import type { Resume } from "../type.ts";

const env = config({
  path: "./.env",
  safe: true,
  example: resolve("./.sqlenv.example"),
});

const client = await new Client().connect({
  hostname: env["SQL_HOSTNAME"],
  username: env["SQL_USERNAME"],
  db: "t7s_resume",
  poolSize: 3, // connection limit
  password: env["SQL_PASSWORD"],
});

const dbData = await client.transaction(async (conn) => {
  return await conn.query(`select * from resume`);
});
if (dbData instanceof Array) {
  const resumes = dbData.map((e) => {
    const resume: Resume = {
      tweetId: null,
      userId: String(e.userid),
      userName: e.username,
      date: e.refresh_date,
      imageUrl: null,
    };
    return resume;
  });

  Deno.writeTextFileSync("./data/sqlData.json", JSON.stringify(resumes));
}

client.close();
