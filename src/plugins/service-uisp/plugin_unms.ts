import { Service } from "./plugin";
import { fastify } from "@bettercorp/service-base-plugin-web-server";
import { MyPluginConfig } from "./sec.config";

export interface UNMSUISPOnEvents {}
export interface UNMSUISPOnReturnableEvents {}
export interface UNMSUISPReturnableEvents {}

export class UISP_UNMS {
  //private uSelf: Service;
  constructor(uSelf: Service) {
    //this.uSelf = uSelf;
  }
  async init(fastify: fastify, config: MyPluginConfig) {
    //const self = this;
  }
}
