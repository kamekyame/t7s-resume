import { createApp, createRouter } from "./deps.ts";
import type { Resume } from "./type.ts";

let mTime: Date = new Date(0);
const rawFilePath = "./data/resumes.json";
const resFilePath = "./data/resumes_res.json";

const checkResFile = () => {
  const fileInfo = (() => {
    try {
      return Deno.statSync(rawFilePath);
    } catch {
      Deno.writeTextFileSync(rawFilePath, JSON.stringify([]));
      return Deno.statSync(rawFilePath);
    }
  })();
  if (!fileInfo.mtime) throw Error("Not suppoted Deno.stat mtime");
  if (mTime.getTime() < fileInfo.mtime.getTime()) {
    console.log("Update");
    mTime = fileInfo.mtime;
    const rawData = JSON.parse(Deno.readTextFileSync(rawFilePath)) as Resume[];
    const resData = rawData.map((resume) => {
      const { res: _, ...data } = resume;
      return data;
    });
    Deno.writeTextFileSync(resFilePath, JSON.stringify(resData));
  }
};
checkResFile();

const app = createApp();
const route = () => {
  const router = createRouter();
  router.get("resumes.json", async (req) => {
    checkResFile();
    //await req.sendFile(resFilePath);
    await req.sendFile("./data/resumes_fix.json");
  });
  return router;
};

app.route("/", route());

app.listen({ port: 8900 });
