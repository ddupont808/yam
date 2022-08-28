import $ from "secret-stack";
import config from "./config";

const stack = $(config);
config.plugins
  .map((p) => (typeof p === "string" ? require(p) : p))
  .forEach(stack.use.bind(stack));

export default stack;

/*

https://github.com/ssbc/ssb-plugins
-> load from config
out of process plugins may be of interest

*/
