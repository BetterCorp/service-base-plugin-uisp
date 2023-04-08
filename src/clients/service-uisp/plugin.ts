import {
  ServicesClient,
  ServiceCallable,
  ServicesBase,
} from "@bettercorp/service-base";
import { UISPReturnableEvents } from "../../plugins/service-uisp/plugin";
import { UCRMClient } from './plugin_ucrm';
import { UNMSClient } from './plugin_unms';

export class UISPClient extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  UISPReturnableEvents,
  ServiceCallable,
  ServiceCallable
> {
  public readonly _pluginName: string = "service-uisp";
  public crm!: UCRMClient;
  public nms!: UNMSClient;
  constructor(self: ServicesBase) {
    super(self);
  }
  override async _register(): Promise<void> {
    await super._register();
    this.crm = new UCRMClient(this, this._plugin);
    this.nms = new UNMSClient(this, this._plugin);
  }
}