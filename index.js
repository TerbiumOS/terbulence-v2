import { createBareServer } from "@tomphttp/bare-server-node";
import express from "express";
import { createServer } from "node:http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import wisp from "wisp-server-node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux";
import "ws";

console.log("Starting Terbium...");
const app = express();
const bare = createBareServer('/bare/')
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  express.static("src", {
    setHeaders: (res, path) => {
      if (path.endsWith(".cjs")) {
        res.setHeader("Content-Type", "text/javascript");
      }
    }
  })
);
app.use("/baremux/", express.static(baremuxPath));
app.use("/libcurl/", express.static(libcurlPath));
const server = createServer();

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else if (req.url.endsWith("/bare")) {
    bare.routeUpgrade(req, socket, head);
  }
});

const port = parseInt(process.env.PORT || "8080");
const manifest = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8');
const { version } = JSON.parse(manifest);
server.listen(port, () => {
  console.log(`
\x1b[38;2;50;174;98m@@@@@@@@@@@@@@~ B@@@@@@@@#G?.       
\x1b[38;2;50;174;98mB###&@@@@&####^ #@@@&PPPB@@@G.      
\x1b[38;2;50;174;98m .. ~@@@@J ..  .#@@@P   ~&@@@^      \x1b[38;2;60;195;240mWelcome to Terbulence v${version}
    \x1b[38;2;50;174;98m^@@@@?     .#@@@@###&@@&7       
    \x1b[38;2;50;174;98m^@@@@?     .#@@@#555P&@@B7      \x1b[38;2;182;182;182mTerbulence is running on ${port}
    \x1b[38;2;50;174;98m^@@@@?     .#@@@P    G@@@@      \x1b[38;2;182;182;182mAny problems you encounter let us know!
    \x1b[38;2;50;174;98m^@@@@?     .#@@@&GGG#@@@@Y      
    \x1b[38;2;50;174;98m^&@@@?      B@@@@@@@@&B5~       
  `);
});

process.on("SIGINT", () => {
  console.log("\x1b[0m");
  process.exit();
});