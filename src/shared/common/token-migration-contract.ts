// @ts-ignore
import Eth from "./ethjs-query";

// @ts-ignore
import EthContract from "ethjs-contract";
import { TOKEN_MIGRATION_CONTRACT } from "./token-migration-contract-abi";

// tslint:disable-next-line:no-any
let contract: any;

const tokenMigrationContractAddr = "0xb98b29e18169ed5114cc0c70433b0c6c108b9a77";

// tslint:disable-next-line:no-any
export function lazyLoadTokenMigrationContract(): any {
  if (contract) {
    return contract;
  }
  // @ts-ignore
  const eth = new Eth(window.web3.currentProvider);
  contract = new EthContract(eth)(TOKEN_MIGRATION_CONTRACT).at(
    tokenMigrationContractAddr
  );
  return contract;
}
