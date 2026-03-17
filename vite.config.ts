import { defineConfig } from "vite";
import vituum from "vituum";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [vituum()],
});
