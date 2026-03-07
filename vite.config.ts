import { defineConfig } from "vite";
import vituum from "vituum";

const isDev = process.env.NODE_ENV !== "production";
export default defineConfig({
  base: isDev ? "" : "/monstersofjungle.de/",
  plugins: [vituum()],
});
