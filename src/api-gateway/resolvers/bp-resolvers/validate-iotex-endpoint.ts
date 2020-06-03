// @flow
import RpcMethod from "iotex-antenna/lib/rpc-method/node-rpc-method";

export async function validateIotexEndpoint(parent: any, args: any) {
  try {
    const client = new RpcMethod(args.endpoint);
    const meta = await client.getChainMeta({});
    const ok = Boolean(meta);

    return {
      ok,
      message: ok ? "" : `${args.endpoint} returns empty result`
    };
  } catch (e) {
    return {
      ok: false,
      message: `failed to connect to ${args.endpoint}: ${JSON.stringify(
        e.message
      )}`
    };
  }
}
