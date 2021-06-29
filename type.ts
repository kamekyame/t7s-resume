import type { StreamTweet } from "./deps.ts";

export interface Resume {
  tweetId: string | null;
  userId: string;
  userName: string;
  date: string | null;
  imageUrl: string | null;
  res: StreamTweet | null;
}
