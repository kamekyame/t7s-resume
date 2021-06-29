import type { Resume } from "../type.ts";

const rawFilePath = "./data/resumes.json";
const fixFilePath = "./data/resumes_fix.json";

const rawData = JSON.parse(Deno.readTextFileSync(rawFilePath)) as Resume[];
const resData = rawData.map((resume) => {
  const data = { ...resume };
  data.userName = resume.name || null;
  data.name = resume.userName || null;
  return data;
});
Deno.writeTextFileSync(fixFilePath, JSON.stringify(resData));
