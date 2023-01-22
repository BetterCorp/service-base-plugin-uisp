import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/interfaces/plugins';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { LogLevel, UNMS } from './unms';
import { IUNMSEvents } from '../../events';
import { IServerConfig, IUNMSPluginConfig, IUNMSUCRMData } from '../../weblib';

export class ucrm extends CPluginClient<IUNMSPluginConfig> {
  public readonly _pluginName: string = "unms";

  async getSites(server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUNMSEvents.getSites, {
      server,
      data: null
    });
  }
  async getDevices(server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUNMSEvents.getDevices, {
      server,
      data: null
    });
  }
  async getDeviceStatistics(server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUNMSEvents.getDeviceStatistics, {
      server,
      data: null
    });
  }
  async getLogs(server: IServerConfig, count?: number, page?: number, siteId?: string, deviceId?: string, level?: LogLevel, period?: number, query?: string) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUNMSEvents.getLogs, {
      server,
      data: {
        count,
        page,
        siteId,
        deviceId,
        level,
        period,
        query
      }
    });
  }
}

export class Plugin extends CPlugin<IUNMSPluginConfig> {
  private setupServer(data: IUNMSUCRMData): Promise<UNMS> {
    return new Promise((resolve, reject) => {
      if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
        return reject('Undefined variables passed in!');
      }
      resolve(new UNMS(data.server));
    });
  }
  private getSites(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getSites().then(resolve).catch(reject)).catch(reject));
  }
  private getDevices(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getDevices().then(resolve).catch(reject)).catch(reject));
  }
  private getDeviceStatistics(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getDeviceStatistics(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getTasks(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getTasks().then(resolve).catch(reject)).catch(reject));
  }
  private getLogs(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getLogs(data.data.count, data.data.page, data.data.siteId, data.data.deviceId, data.data.level, data.data.period, data.data.query).then(resolve).catch(reject)).catch(reject));
  }

  init(): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      await self.onReturnableEvent(null, IUNMSEvents.getSites, (data) => self.getSites(data));
      await self.onReturnableEvent(null, IUNMSEvents.getDevices, (data) => self.getDevices(data));
      await self.onReturnableEvent(null, IUNMSEvents.getDeviceStatistics, (data) => self.getDeviceStatistics(data));
      await self.onReturnableEvent(null, IUNMSEvents.getTasks, (data) => self.getTasks(data));
      await self.onReturnableEvent(null, IUNMSEvents.getLogs, (data) => self.getLogs(data));

      self.log.info("UNMS Ready");
      resolve();
    });
  }
};