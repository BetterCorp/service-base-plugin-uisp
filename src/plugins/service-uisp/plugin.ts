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
import {
  UNMSUISPOnEvents,
  UNMSUISPReturnableEvents,
  UNMSUISPOnReturnableEvents,
  UISP_UNMS,
} from "./plugin_unms";

export interface UISPOnEvents
  extends UCRMUISPOnEvents,
    UNMSUISPOnEvents,
    ServiceCallable {}
export interface UISPReturnableEvents
  extends UCRMUISPReturnableEvents,
    UNMSUISPReturnableEvents,
    ServiceCallable {}
export interface UISPOnReturnableEvents
  extends UCRMUISPOnReturnableEvents,
    UNMSUISPOnReturnableEvents,
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
  private nms: UISP_UNMS;
  protected fastify: fastify;
  constructor(
    pluginName: string,
    cwd: string,
    pluginCwd: string,
    log: IPluginLogger
  ) {
    super(pluginName, cwd, pluginCwd, log);
    this.crm = new UISP_UCRM(this);
    this.nms = new UISP_UNMS(this);
    this.fastify = new fastify(this);
  }
  async init() {
    this.crm.init(this.fastify, await this.getPluginConfig());
    this.nms.init(this.fastify, await this.getPluginConfig());
  }
}
