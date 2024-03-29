import { ServiceCallable } from "@bettercorp/service-base";
import { UISPReturnableEvents } from "../../plugins/service-uisp/plugin";
import { RegisteredPlugin } from "@bettercorp/service-base/lib/service/serviceClient";
import { UISPClient } from "./plugin";

export class UNMSClient {
  //private uSelf: UISPClient;
  private _plugin: RegisteredPlugin<
    ServiceCallable,
    ServiceCallable,
    UISPReturnableEvents,
    ServiceCallable,
    ServiceCallable,
    any
  >;
  constructor(
    uSelf: UISPClient,
    _plugin: RegisteredPlugin<
      ServiceCallable,
      ServiceCallable,
      UISPReturnableEvents,
      ServiceCallable,
      ServiceCallable,
      any
    >
  ) {
    //this.uSelf = uSelf;
    this._plugin = _plugin;
  }
  public async getSites(hostname: string, key: string): Promise<any> {
    return await this._plugin.emitEventAndReturn("nms_getSites", hostname, key);
  }
  public async getDevices(hostname: string, key: string): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "nms_getDevices",
      hostname,
      key
    );
  }
  public async getDeviceStatistics(
    hostname: string,
    key: string,
    deviceId: string
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "nms_getDeviceStatistics",
      hostname,
      key,
      deviceId
    );
  }
  public async getTasks(hostname: string, key: string): Promise<any> {
    return await this._plugin.emitEventAndReturn("nms_getTasks", hostname, key);
  }
  public async getLogs(
    hostname: string,
    key: string,
    count: number,
    page: number,
    siteId: string,
    deviceId: string,
    level: number,
    period: number,
    query: string
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "nms_getLogs",
      hostname,
      key,
      count,
      page,
      siteId,
      deviceId,
      level,
      period,
      query
    );
  }
}
