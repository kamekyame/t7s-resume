import type { Resume } from "./type.ts";

const filePath = "./data/resumes.json";

const data = JSON.parse(Deno.readTextFileSync(filePath)) as Resume[];

const urlList: string[] = [];
const fixData = data.filter((d) => {
  const url = d.imageUrl;
  if (!url) return true;
  else if (urlList.some((e) => e === url)) return false;
  else {
    urlList.push(url);
    return true;
  }
});

Deno.writeTextFileSync("./data/resumes_fix.json", JSON.stringify(fixData));
