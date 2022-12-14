// https://gitlab.com/regular1/secret-stack-decorators/-/blob/master/test.ts
import type {
  CookieSerializeOptions,
  FastifyCookieOptions,
} from "@fastify/cookie";

import fs from "fs";
import { plugin, local } from "secret-stack-decorators";
import Fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
// import fastifySession from "@fastify/session";
import path from "path";
import { Server } from "http";
import { Stack } from "../types";
import { number } from "yargs";

const util = require("util");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);

const { where, and, type, key, toCallback } = require("ssb-db2/operators");

let server: FastifyInstance;

@plugin("0.0.1")
class web {
  constructor(api: Stack, opts: any) {
    server = Fastify({
      logger: true,
    });

    server.register(fastifyStatic, {
      root: path.join(__dirname, "./site/public"),
      prefix: "/",
    });

    server.register(require("@fastify/secure-session"), {
      // the name of the session cookie, defaults to 'session'
      cookieName: "my-session-cookie",
      // adapt this to point to the directory where secret-key is located
      key: fs.readFileSync(path.join(__dirname, "../assets/example-key.txt")),
      cookie: {
        path: "/",
        // options for setCookie, see https://github.com/fastify/fastify-cookie
      },
    });

    // server.register(fastifyCookie);
    // server.register(fastifySession, {
    //   secret: "a secret with minimum length of 32 characters",
    // });

    server.register(require("@fastify/formbody"));
    server.register(require("@fastify/multipart"));

    server.register(fastifyView, {
      engine: {
        ejs: require("ejs"),
      },
      layout: "./layouts/main.ejs",
      root: path.join(__dirname, "./site"),
    });

    server.register(fastifyView, {
      engine: {
        ejs: require("ejs"),
      },
      layout: "/layouts/embed.ejs",
      root: path.join(__dirname, "./site"),
      propertyName: "embed",
    });

    server.post("/login", function (req: any, reply) {
      req.session.set("user", req.body.user ?? "guest");
      req.session.set("key", req.body.key ?? req.body.user + req.body.pass);

      console.log(req.session.data());
      reply.redirect("/");
    });

    server.post("/logout", (request: any, reply) => {
      request.session.delete();
      reply.redirect("/");
    });

    const start = async () => {
      try {
        await server.listen({
          port: parseInt(process.env.YAM_HTTP_PORT || "8080"),
        });
      } catch (err) {
        server.log.error(err);
        process.exit(1);
      }
    };

    start();
  }

  @local()
  public get(url: string, callback: RouteHandlerMethod) {
    return server.get(url, callback);
  }

  @local()
  public post(url: string, callback: RouteHandlerMethod) {
    return server.post(url, callback);
  }

  @local()
  public listen(
    port: number,
    callback: (err: Error | null, address: string) => void
  ) {
    return server.listen({ port }, callback);
  }
}

module.exports = web;
