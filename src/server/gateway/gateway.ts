import mongoose from "mongoose";
import { MyServer } from "../start-server";
import { BpServerStatus } from "./bp-server-status";

export type Gateways = {
  mongoose: mongoose.Mongoose;
  bpServerStatus: BpServerStatus;
  expMins: number;

};

export function setGateways(server: MyServer): void {
  server.gateways = server.gateways || {};

  server.gateways.bpServerStatus = new BpServerStatus(server);
  if (
    // @ts-ignore
    !(server.config.gateways.mongoose && server.config.gateways.mongoose.uri)
  ) {
    server.logger.warn(
      "cannot start server without gateways.mongoose.uri provided in configuration"
    );
  } else {
    // @ts-ignore
    mongoose.connect(server.config.gateways.mongoose.uri).catch(err => {
      server.logger.warn(`failed to connect mongoose: ${err}`);
    });
  }
  // @ts-ignore
  server.gateways.mongoose = mongoose;
}
