import { createApp, createRouter } from "./deps.ts";

const app = createApp();
const route = () => {
  const router = createRouter();
  router.get("resumes.json", async (req) => {
    await req.sendFile("./data/resumes.json");
  });
  return router;
};

app.route("/", route());

app.listen({ port: 8900 });
