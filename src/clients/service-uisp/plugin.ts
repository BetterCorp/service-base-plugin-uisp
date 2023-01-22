import {
  ServicesClient,
  ServiceCallable,
  ServicesBase,
} from "@bettercorp/service-base";
import { MyPluginConfig } from "../../plugins/service-uisp/sec.config";
import { UISPReturnableEvents } from "../../plugins/service-uisp/plugin";
import { UCRMClient } from './plugin_ucrm';

export class UISPClient extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  UISPReturnableEvents,
  ServiceCallable,
  ServiceCallable,
  MyPluginConfig
> {
  public readonly _pluginName: string = "service-uisp";
  public crm: UCRMClient;
  constructor(self: ServicesBase) {
    super(self);
    this.crm = new UCRMClient(this, this._plugin);
  }
  public async register(): Promise<void> {
    await this._register();
  }
}