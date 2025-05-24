import { reactRouter } from "@react-router/dev/vite";
import { getRequestListener } from "@hono/node-server";
import { server as honoServer } from "./src/server";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), {
    name: "api-server",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api")) {
          return next();
        }
        getRequestListener(async (request) => {
          return await honoServer.fetch(request, {});
        })(req, res);
      })
    }
  }],
});
