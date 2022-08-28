import { RouteHandlerMethod } from "fastify";
import { Logger } from "pino";
import { ItemDetails } from "./plugins/item";

export interface Stack {
  web: {
    [x: string]: any;
    get: (path: string, callback: RouteHandlerMethod) => void;
    listen: (
      port: string | number,
      callback: (err: Error | null, address: string) => void
    ) => void;
  };
  item: {
    create: (details: ItemDetails, callback: any) => void;
    read: (id: any, callback: any) => void;
    update: (id: any, details: ItemDetails, callback: any) => void;
    delete: (id: any, callback: any) => void;
    list: (opts: any) => Promise<any[]>;
  };
  threads: any;
  getManifest(): any;
  id: string;
  config: any;
  logger: Logger;
}
