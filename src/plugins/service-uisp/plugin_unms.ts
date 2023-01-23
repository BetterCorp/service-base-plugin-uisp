import { Service } from "./plugin";
import { fastify } from "@bettercorp/service-base-plugin-web-server";
import { MyPluginConfig } from "./sec.config";
import { UNMS } from "./unms";

export interface UNMSUISPOnEvents {}
export interface UNMSUISPOnReturnableEvents {}
export interface UNMSUISPReturnableEvents {
  nms_getSites(hostname: string, key: string): Promise<Array<any>>;
  nms_getDevices(hostname: string, key: string): Promise<Array<any>>;
  nms_getDeviceStatistics(
    hostname: string,
    key: string,
    deviceId: string
  ): Promise<Array<any>>;
  nms_getTasks(hostname: string, key: string): Promise<Array<any>>;
  nms_getLogs(
    hostname: string,
    key: string,
    count: number,
    page: number,
    siteId: string,
    deviceId: string,
    level: number,
    period: number,
    query: string
  ): Promise<Array<any>>;
}

export class UISP_UNMS {
  private uSelf: Service;
  constructor(uSelf: Service) {
    this.uSelf = uSelf;
  }
  private setupServer(hostname: string, key: string): UNMS {
    return new UNMS({ hostname, key });
  }
  async init(fastify: fastify, config: MyPluginConfig) {
    const self = this;
    await self.uSelf.onReturnableEvent(
      "nms_getSites",
      async (hostname: string, key: string) => {
        return await self.setupServer(hostname, key).getSites();
      }
    );
    await self.uSelf.onReturnableEvent(
      "nms_getDevices",
      async (hostname: string, key: string) => {
        return await self.setupServer(hostname, key).getDevices();
      }
    );
    await self.uSelf.onReturnableEvent(
      "nms_getDeviceStatistics",
      async (hostname: string, key: string, deviceId: string) => {
        return await self
          .setupServer(hostname, key)
          .getDeviceStatistics(deviceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "nms_getTasks",
      async (hostname: string, key: string) => {
        return await self.setupServer(hostname, key).getTasks();
      }
    );
    await self.uSelf.onReturnableEvent(
      "nms_getLogs",
      async (
        hostname: string,
        key: string,
        count: number,
        page: number,
        siteId: string,
        deviceId: string,
        level: number,
        period: number,
        query: string
      ) => {
        return await self
          .setupServer(hostname, key)
          .getLogs(count, page, siteId, deviceId, level, period, query);
      }
    );
  }
}
