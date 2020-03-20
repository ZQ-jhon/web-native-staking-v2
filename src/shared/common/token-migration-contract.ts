// @ts-ignore
import Eth from "./ethjs-query";

// @ts-ignore
import EthContract from "ethjs-contract";
import { TOKEN_MIGRATION_CONTRACT } from "./token-migration-contract-abi";

// tslint:disable-next-line:no-any
let contract: any;

const nameRegistrationContractAddr = "0x";

// tslint:disable-next-line:no-any
export function lazyLoadTokenMigrationContract(): any {
  if (contract) {
    return contract;
  }
  // @ts-ignore
  const eth = new Eth(window.web3.currentProvider);
  contract = new EthContract(eth)(TOKEN_MIGRATION_CONTRACT).at(
    nameRegistrationContractAddr
  );
  return contract;
}
