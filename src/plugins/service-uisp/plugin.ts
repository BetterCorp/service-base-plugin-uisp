import {
  IPluginLogger,
  ServiceCallable,
  ServicesBase,
} from "@bettercorp/service-base";
import { MyPluginConfig } from "./sec.config";
import { UCRMUISPReturnableEvents, UISP_UCRM } from "./plugin_ucrm";

export interface UISPReturnableEvents
  extends UCRMUISPReturnableEvents,
    ServiceCallable {}

export class Service extends ServicesBase<
  ServiceCallable,
  ServiceCallable,
  UISPReturnableEvents,
  ServiceCallable,
  ServiceCallable,
  MyPluginConfig
> {
  private crm: UISP_UCRM;
  constructor(
    pluginName: string,
    cwd: string,
    pluginCwd: string,
    log: IPluginLogger
  ) {
    super(pluginName, cwd, pluginCwd, log);
    this.crm = new UISP_UCRM(this);
  }
  async init() {
    this.crm.init();
  }
}
