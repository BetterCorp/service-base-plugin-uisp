import { CPlugin } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { UNMS } from './unms';
import { IUNMSEvents } from '../../events';
import { IUNMSUCRMData } from '../../weblib';

export class Plugin extends CPlugin<any> {
  init (): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.onReturnableEvent(null, IUNMSEvents.GetSites, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UNMS(data.server).getSites().then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      self.onReturnableEvent(null, IUNMSEvents.GetDevices, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UNMS(data.server).getDevices().then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      self.onReturnableEvent(null, IUNMSEvents.GetDeviceStatistics, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UNMS(data.server).getDeviceStatistics(data.data).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      self.onReturnableEvent(null, IUNMSEvents.GetTasks, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UNMS(data.server).getTasks().then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      self.onReturnableEvent(null, IUNMSEvents.GetLogs, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UNMS(data.server).getLogs(data.data.count, data.data.page, data.data.siteId, data.data.deviceId, data.data.level, data.data.period, data.data.query).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      self.log.info("UCRM Ready");
      resolve();
    });
  }
};