// @flow
import { readFileSync } from "fs";
import type { TResolverCtx } from "../../types";

export async function poll(parent: any, args: any) {
  const { address } = args;
  return JSON.parse(readFileSync(`${__dirname}/data/${address}.json`, "utf-8"));
}

export async function polls(parent: any, args: any, context: TResolverCtx) {
  const { offset, limit } = args;

  const polls = await context.gateways.pollManager.getPolls(
    context,
    offset,
    limit
  );
  polls.unshift(
    JSON.parse(
      readFileSync(
        `${__dirname}/data/io1wnh8awy289nthfslut3nfrdakukmm8nemtgxjx.json`,
        "utf-8"
      )
    )
  );
  return polls;
}
