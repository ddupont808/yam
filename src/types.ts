import { RouteHandlerMethod } from "fastify";
import { Logger } from "pino";
// import { Keys } from "ssb-keys";
import { ItemDetails } from "./plugins/item";

export type Callback<T> = (err?: any, val?: T) => void;

export interface Stack {
  db: any;
  identities: {
    [x: string]: any;
    createNewKey: (curve?: string, seed?: Buffer) => any;
  };
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

export interface FeedObject {
  key: string;
  value: {
    previous: any;
    sequence: number;
    author: string;
    timestamp: number;
    hash: string;
    content: any;
    signature: string;
  };
  timestamp: number;
}
