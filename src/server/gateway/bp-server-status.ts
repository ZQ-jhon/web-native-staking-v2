// @flow
import cacheManager from "cache-manager";
import { logger } from "onefx/lib/integrated-gateways/logger";
import axios from "axios";
import { TserverCache, TServerStatus } from "../../types/global";

export const SERVER_STATUS_TTL = 5 * 60; // sec
const axiosInstance = axios.create({ timeout: 10000 });

function getJitter() {
  return (
    SERVER_STATUS_TTL + (Math.floor(Math.random() * 10000) % SERVER_STATUS_TTL)
  );
}

export const statusCache = cacheManager.caching({
  store: "memory",
  max: 200,
  ttl: SERVER_STATUS_TTL
});

export class BpServerStatus {
  server: any;

  constructor(server: any) {
    this.server = server;
  }

  async ping(serverHealthEndpoint: string): Promise<TserverCache> {
    const serverCache = { status: "NOT_EQUIPPED", nodeVersion: "" };
    try {
      const [resStatus, resVersion] = await Promise.all([
        axiosInstance.get(serverHealthEndpoint),
        axiosInstance.get(
          `${serverHealthEndpoint.replace("health", "metrics")}`
        )
      ]);
      // $FlowFixMe
      const status = resStatus.data === "OK" ? "ONLINE" : "OFFLINE";
      const reg = /source="(.+)",status_type="packageVersion"/;
      let [, nodeVersion] = resVersion.data.match(reg);
      await statusCache.set(
        serverHealthEndpoint,
        { status, nodeVersion },
        {
          ttl: getJitter()
        }
      );
      return { status, nodeVersion };
    } catch (err) {
      logger.warn(
        `failed to get status from ${serverHealthEndpoint}: ${err.message}`
      );
      await statusCache.set(serverHealthEndpoint, serverCache, {
        ttl: getJitter()
      });
      return serverCache as TserverCache;
    }
  }

  async readThroughPingCache(serverEndpoint: string): Promise<TserverCache> {
    let serverCache = { status: "NOT_EQUIPPED", nodeVersion: "" };
    if (!serverEndpoint) {
      return serverCache as TserverCache;
    }

    try {
      // $FlowFixMe
      serverCache = await statusCache.get(serverEndpoint);
      if (serverCache) {
        return serverCache as TserverCache;
      }
      return this.ping(serverEndpoint);
    } catch (err) {
      logger.warn(
        `failed to get status cache from ${serverEndpoint}: ${err.message}`
      );
      await statusCache.set(serverEndpoint, serverCache, {
        ttl: getJitter()
      });
      return serverCache as TserverCache;
    }
  }
}
