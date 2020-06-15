/* eslint-disable */
const format = require("ethjs-format");
const EthRPC = require("ethjs-rpc");
const promiseToCallback = require("promise-to-callback");

export function Eth(provider: any, options: any) {
  // @ts-ignore
  const self = this;
  const optionsObject = options || {};
  
  // @ts-ignore
  if (!(this instanceof Eth)) {
    throw new Error(
      '[ethjs-query] the Eth object requires the "new" flag in order to function normally (i.e. `const eth = new Eth(provider);`).'
    );
  }
  if (typeof provider !== "object") {
    throw new Error(
      `[ethjs-query] the Eth object requires that the first input 'provider' must be an object, got '${typeof provider}' (i.e. 'const eth = new Eth(provider);')`
    );
  }

  self.options = Object.assign({
    debug: optionsObject.debug || false,
    logger: optionsObject.logger || console,
    jsonSpace: optionsObject.jsonSpace || 0
  });
  self.rpc = new EthRPC(provider);
  self.setProvider = self.rpc.setProvider;
}

Eth.prototype.log = function log(message: any) {
  const self = this;
  if (self.options.debug)
    self.options.logger.log(`[ethjs-query log] ${message}`);
};

Object.keys(format.schema.methods).forEach(rpcMethodName => {
  Object.defineProperty(Eth.prototype, rpcMethodName.replace("eth_", ""), {
    enumerable: true,
    value: generateFnFor(rpcMethodName, format.schema.methods[rpcMethodName])
  });
});

// @ts-ignore
function generateFnFor(rpcMethodName, methodObject) {
  return function outputMethod() {
    let callback = null; // eslint-disable-line
    let inputs = null; // eslint-disable-line
    // let inputError = null; // eslint-disable-line
    // @ts-ignore
    const self = this;
    const args = [].slice.call(arguments); // eslint-disable-line
    const protoMethodName = rpcMethodName.replace("eth_", ""); // eslint-disable-line

    if (args.length > 0 && typeof args[args.length - 1] === "function") {
      callback = args.pop();
    }
    // @ts-ignore
    const promise = performCall.call(this);

    // if callback provided, convert promise to callback
    if (callback) {
      return promiseToCallback(promise)(callback);
    }

    // only return promise if no callback provided
    return promise;

    async function performCall() {
      // validate arg length
      if (args.length < methodObject[2]) {
        throw new Error(
          `[ethjs-query] method '${protoMethodName}' requires at least ${
            methodObject[2]
          } input (format type ${methodObject[0][0]}), ${
            args.length
          } provided. For more information visit: https://github.com/ethereum/wiki/wiki/JSON-RPC#${rpcMethodName.toLowerCase()}`
        );
      }
      if (args.length > methodObject[0].length) {
        throw new Error(
          `[ethjs-query] method '${protoMethodName}' requires at most ${
            methodObject[0].length
            // @ts-ignore
          } params, ${args.length} provided '${(args,
          null,
          self.options
            .jsonSpace)}'. For more information visit: https://github.com/ethereum/wiki/wiki/JSON-RPC#${rpcMethodName.toLowerCase()}`
        );
      }

      // set default block
      if (methodObject[3] && args.length < methodObject[3]) {
        // @ts-ignore
        args.push("latest");
      }

      // format inputs
      // @ts-ignore
      this.log(
        // @ts-ignore
        `attempting method formatting for '${protoMethodName}' with inputs ${(args,
        null,
        // @ts-ignore
        this.options.jsonSpace)}`
      );
      try {
        inputs = format.formatInputs(rpcMethodName, args);
        // @ts-ignore
        this.log(
          // @ts-ignore
          `method formatting success for '${protoMethodName}' with formatted result: ${(inputs,null, this.options.jsonSpace)}`
        );
      } catch (formattingError) {
        throw new Error(
          // @ts-ignore
          `[ethjs-query] while formatting inputs '${(args, null, this.options
            .jsonSpace)}' for method '${protoMethodName}' error: ${formattingError}`
        );
      }

      // perform rpc call
      // @ts-ignore
      const result = await this.rpc.sendAsync({
        method: rpcMethodName,
        params: inputs
      });

      // format result
      try {
        // @ts-ignore
        this.log(
          // @ts-ignore
          `attempting method formatting for '${protoMethodName}' with raw outputs: ${(result, null, this.options.jsonSpace)}`
        );
        const methodOutputs = format.formatOutputs(rpcMethodName, result);
        // @ts-ignore
        this.log(
          // @ts-ignore
          `method formatting success for '${protoMethodName}' formatted result: ${(methodOutputs, null, this.options.jsonSpace)}`
        );
        return methodOutputs;
      } catch (outputFormattingError) {
        const outputError = new Error(
          // @ts-ignore
          `[ethjs-query] while formatting outputs from RPC '${(result, null, this.options
            .jsonSpace)}' for method '${protoMethodName}' ${outputFormattingError}`
        );
        throw outputError;
      }
    }
  };
}
