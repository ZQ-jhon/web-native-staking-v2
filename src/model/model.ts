import { MyServer } from "../server/start-server";
import { BpCandidateModel } from "./bp-candidate-model";

export function setModel(server: MyServer): void {
  server.model = server.model || {};
  server.model.bpCandidate = new BpCandidateModel(server.gateways);
}
