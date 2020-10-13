import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { UNMS } from './unms';
import { IUNMSEvents } from '../../events';
import { IUNMSUCRMEmitter } from '../../weblib';

export class Plugin implements IPlugin {
  init (features: PluginFeature): Promise<void> {
    return new Promise((resolve) => {
      features.onEvent(null, IUNMSEvents.GetSites, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UNMS(arg.data.server).getSites().then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUNMSEvents.GetDevices, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UNMS(arg.data.server).getDevices().then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUNMSEvents.GetDeviceStatistics, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UNMS(arg.data.server).getDeviceStatistics(arg.data.data).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUNMSEvents.GetTasks, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UNMS(arg.data.server).getTasks().then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUNMSEvents.GetLogs, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UNMS(arg.data.server).getLogs(arg.data.data.count, arg.data.data.page, arg.data.data.siteId, arg.data.data.deviceId, arg.data.data.level, arg.data.data.period, arg.data.data.query).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.log.info("UCRM Ready");
      resolve();
    });
  }
};