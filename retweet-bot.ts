import {
  changeRules,
  getRules,
  OAuth1Info,
  statusRetweet,
  StreamParam,
  StreamTweet,
} from "./deps.ts";

import { Resume } from "./type.ts";

export class ResumeRetweet {
  private readonly auth: OAuth1Info;
  private readonly bearerToken: string;
  private readonly fileName = "resumes.json";

  private searchTexts = [
    "#支配人履歴書",
    "#ナナシス履歴書",
    "履歴書 支配人 更新",
    "履歴書 支配人 作成",
    "履歴書 ナナシス 更新",
    "履歴書 ナナシス 作成",
  ];

  private readonly tag = "t7sResumeBOT";
  private readonly value = () =>
    `has:images (${this.searchTexts.map((e) => `(${e})`).join(" OR ")})`;

  private resumes: Resume[] = [];
  constructor(auth: OAuth1Info, bearerToken: string) {
    this.auth = auth;
    this.bearerToken = bearerToken;
    this.read();
  }

  private read() {
    try {
      this.resumes = JSON.parse(
        Deno.readTextFileSync("./data/" + this.fileName),
      );
    } catch (_) {
      //
    }
  }

  private write() {
    Deno.writeTextFileSync(
      "./data/" + this.fileName,
      JSON.stringify(this.resumes),
    );
  }

  public async checkRule() {
    console.log(this.tag, this.value());
    const rules = await getRules(this.bearerToken);
    console.log(rules);
    if (!rules.data?.some((d) => d.value === this.value())) {
      const aRules = await changeRules(this.bearerToken, {
        add: [{ value: this.value(), tag: this.tag }],
      });
      console.log(aRules);
    }
  }

  public async callback(res: StreamTweet) {
    //Deno.writeTextFileSync(`res${count++}.json`, JSON.stringify(res));
    if (!res.matching_rules.some((e) => e.tag === this.tag)) return;
    const getUser = () => {
      if (res.includes?.users) {
        return res.includes.users.find((u) =>
          u.username !== "t7s_resume" && u.id === res.data.author_id
        );
      }
    };
    const user = getUser();
    if (!user) return;

    console.log(res, user);

    const media = res.includes?.media && res.includes.media[0];
    if (!media) return;
    if (media.type !== "photo") return;

    const _retweetRes = await statusRetweet(this.auth, res.data.id);

    const resume: Resume = {
      tweetId: res.data.id,
      userId: user.id,
      userName: user.name,
      date: res.data.created_at || null,
      imageUrl: media.url || null,
    };
    console.log(`[${new Date().toISOString()}]`, resume);
    this.resumes.push(resume);
    this.write();
  }
}

export const option: StreamParam = {
  expansions: { author_id: true, "attachments.media_keys": true },
  "user.fields": { username: true },
  "tweet.fields": { created_at: true },
  "media.fields": { url: true, preview_image_url: true },
};
