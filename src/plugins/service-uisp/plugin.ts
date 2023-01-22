import {
  IPluginLogger,
  ServiceCallable,
  ServicesBase,
} from "@bettercorp/service-base";
import { MyPluginConfig } from "./sec.config";
import {
  UCRMUISPOnEvents,
  UCRMUISPOnReturnableEvents,
  UCRMUISPReturnableEvents,
  UISP_UCRM,
} from "./plugin_ucrm";
import { fastify } from "@bettercorp/service-base-plugin-web-server";

export interface UISPOnEvents
  extends UCRMUISPOnEvents,
    ServiceCallable {}
export interface UISPReturnableEvents
  extends UCRMUISPReturnableEvents,
    ServiceCallable {}
export interface UISPOnReturnableEvents
  extends UCRMUISPOnReturnableEvents,
    ServiceCallable {}

export class Service extends ServicesBase<
  ServiceCallable,
  UISPOnEvents,
  UISPReturnableEvents,
  UISPOnReturnableEvents,
  ServiceCallable,
  MyPluginConfig
> {
  private crm: UISP_UCRM;
  protected fastify: fastify;
  constructor(
    pluginName: string,
    cwd: string,
    pluginCwd: string,
    log: IPluginLogger
  ) {
    super(pluginName, cwd, pluginCwd, log);
    this.crm = new UISP_UCRM(this);
    this.fastify = new fastify(this);
  }
  async init() {
    this.crm.init(this.fastify, await this.getPluginConfig());
  }
}
