import { SecConfig } from "@bettercorp/service-base";
import { Tools } from "@bettercorp/tools";

export enum SupportedService {
  UISP = "uisp",
  Splynx = "splynx",
}
export interface MyPluginConfig {
  supportedServices: Array<SupportedService>; // Supported services: Array of supported services
  myHost: string; // My Host
  webhooks: boolean; // Enable webhooks
}

export class Config extends SecConfig<MyPluginConfig> {
  public override migrate(
    mappedPluginName: string,
    existingConfig: MyPluginConfig
  ): MyPluginConfig {
    let newConfig: any = {
      supportedServices: Tools.isArray(existingConfig.supportedServices)
        ? existingConfig.supportedServices
        : [],
      myHost: !Tools.isNullOrUndefined(existingConfig.myHost)
        ? existingConfig.myHost
        : "http://localhost.never",
        webhooks: !Tools.isNullOrUndefined(existingConfig.webhooks)
        ? existingConfig.webhooks
        : false,
    };

    return newConfig;
  }
}
