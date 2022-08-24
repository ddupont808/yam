console.log("Starting yet another SSB server...");

import stack from "./src/stack";

stack.web.listen(8080, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
