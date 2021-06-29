import type { StreamTweet } from "./deps.ts";

export interface Resume {
  tweetId: string | null;
  userId: string;
  userName: string | null;
  name: string | null;
  date: string | null;
  imageUrl: string | null;
  res: StreamTweet | null;
}
