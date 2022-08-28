import pino, { Logger } from "pino";

import { local, plugin } from "secret-stack-decorators";
import { Stack } from "../types";

@plugin("0.0.1")
class logger {
  logger: any;

  constructor(api: Stack, opts: any) {
    this.logger = pino({
      level: process.env.YAM_LOGGER_LEVEL || "info",
    });
  }

  @local()
  fatal = (...args: any[]) => this.logger.fatal(...args);

  @local()
  error = (...args: any[]) => this.logger.error(...args);

  @local()
  warn = (...args: any[]) => this.logger.warn(...args);

  @local()
  debug = (...args: any[]) => this.logger.debug(...args);

  @local()
  trace = (...args: any[]) => this.logger.trace(...args);

  @local()
  info = (...args: any[]) => this.logger.info(...args);
}

module.exports = logger;
