import {
  changeRules,
  getRules,
  OAuth1Info,
  statusRetweet,
  StreamParam,
  StreamTweet,
  TweetObject,
} from "./deps.ts";

import { Resume } from "./type.ts";

let count = 0;

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

  private addResume(resume: Resume) {
    const sameTweet = this.resumes.find((r) => r.tweetId == resume.tweetId);
    if (sameTweet) return;
    this.resumes.push(resume);
    this.write();
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
    if (!res.matching_rules.some((e) => e.tag === this.tag)) return;
    //Deno.writeTextFileSync(`./sample/res${count++}.json`, JSON.stringify(res));

    // 画像が無かったらreturn
    const media = res.includes?.media && res.includes.media[0];
    if (!media) return;
    if (media.type !== "photo") return;

    let tweet: TweetObject | undefined = undefined;
    if (res.data.text.startsWith("RT")) {
      const referencedTweets = res.data.referenced_tweets;
      if (!referencedTweets) return;
      if (referencedTweets[0].type !== "retweeted") return;

      tweet = res.includes?.tweets?.find((tweet) =>
        tweet.id === referencedTweets[0].id
      );
    } else {
      tweet = res.data;
    }
    if (!tweet) return;
    const user = res.includes?.users?.find((user) =>
      user.id === tweet?.author_id
    );
    if (!user) return;

    const _retweetRes = await statusRetweet(this.auth, res.data.id);

    const resume: Resume = {
      tweetId: tweet.id,
      userId: user.id,
      userName: user.name,
      date: tweet.created_at || null,
      imageUrl: media.url || null,
      res,
    };
    console.log(resume);
    this.addResume(resume);
  }
}

export const option: StreamParam = {
  expansions: {
    author_id: true,
    "attachments.media_keys": true,
    "referenced_tweets.id": true,
    "referenced_tweets.id.author_id": true,
  },
  "user.fields": { username: true },
  "tweet.fields": { created_at: true },
  "media.fields": { url: true, preview_image_url: true },
};
