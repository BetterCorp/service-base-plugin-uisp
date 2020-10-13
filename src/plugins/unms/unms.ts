import { Tools } from '@bettercorp/tools/lib/Tools';
import { IServerConfig, webRequest as CWR } from '../../weblib';

export class UNMS implements IUNMS {
  private ServerConfig: IServerConfig;
  constructor(server: IServerConfig) {
    this.ServerConfig = server;
  }

  private webRequest (path: string, method: string, params: Object | undefined = undefined, data: Object | undefined = undefined, additionalProps: Object | undefined = undefined) {
    return CWR(this.ServerConfig, '/nms/api/v2.1', path, method, params, data, additionalProps);
  }

  getSites (): Promise<any[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.webRequest('/sites', 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  getDevices (): Promise<any[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.webRequest('/devices', 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  getDeviceStatistics (deviceId: string): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.webRequest(`/devices/${deviceId}/statistics`, 'GET').then(x => resolve(x)).catch(reject);
    });
  }
  getTasks (): Promise<any[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.webRequest(`/tasks`, 'GET').then((x: any) => resolve(x)).catch(reject);
    });
  }
  getLogs (count?: Number, page?: Number, siteId?: string, deviceId?: string, level?: LogLevel, period?: Number, query?: string): Promise<any[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      let params: Array<string> = [];

      params.push(`count=${count || 1000}`);
      params.push(`page=${page || 1}`);
      if (!Tools.isNullOrUndefined(siteId))
        params.push(`siteId=${siteId}`);
      if (!Tools.isNullOrUndefined(deviceId))
        params.push(`deviceId=${deviceId}`);
      if (!Tools.isNullOrUndefined(level))
        params.push(`level=${level}`);
      if (!Tools.isNullOrUndefined(period))
        params.push(`period=${period}`);
      if (!Tools.isNullOrUndefined(query))
        params.push(`query=${query}`);

      self.webRequest(`/logs?${params.join('&')}`, 'GET').then((x: any) => resolve(x)).catch(reject);
    });
  }
  getOutages (count?: Number, page?: Number, siteId?: string, deviceId?: string, type?: OutageType, period?: Number, query?: string): Promise<any[]> {
    //const self = this;
    return new Promise((resolve, reject) => {
      reject();
    });
  }
}

export enum OutageType {
  outage, quality
}

export enum LogLevel {
  info, warning, error
}

export interface IUNMS {
  getSites (): Promise<Array<any>>;
  getDevices (): Promise<Array<any>>;
  getDeviceStatistics (deviceId: string): Promise<any>;
  getTasks (): Promise<Array<any>>;
  getLogs (count?: Number, page?: Number, siteId?: string, deviceId?: string, level?: LogLevel, period?: Number, query?: string): Promise<Array<any>>;
  getOutages (count?: Number, page?: Number, siteId?: string, deviceId?: string, type?: OutageType, period?: Number, query?: string): Promise<Array<any>>;
}
