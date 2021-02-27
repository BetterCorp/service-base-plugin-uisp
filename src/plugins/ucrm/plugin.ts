import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { UCRM } from './ucrm';
import { IUCRMEvents } from '../../events';
import { IUNMSUCRMData } from '../../weblib';

export class Plugin implements IPlugin {
  init (features: PluginFeature): Promise<void> {
    return new Promise((resolve) => {
      features.onReturnableEvent(null, IUCRMEvents.AddPayment, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addPayment(data.data.clientId,
          data.data.paymentMethod,
          data.data.amount,
          data.data.note,
          data.data.invoiceIds,
          data.data.applyToInvoicesAutomatically,
          data.data.userId,
          data.data.additionalProps).then(x => {
            resolve(x);
          }).catch(x => {
            reject(x);
          });
      });

      features.onReturnableEvent(null, IUCRMEvents.AddPayments, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addPayment(data.data.clientId, data.data.method,
          data.data.amount, data.data.note, data.data.invoiceIds, data.data.applyToInvoicesAutomatically,
          data.data.userId, data.data.additionalProps).then(x => {
            resolve(x);
          }).catch(x => {
            reject(x);
          });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetClients, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getClient(data.data.id, data.data.email).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetInvoices, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getInvoices(data.data.id, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetServices, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServices(data.data.id, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.ValidateServiceForClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServices(data.data.id, data.data.crmId).then((x: any) => {
          if (Tools.isNullOrUndefined(x))
            return resolve(false);
          if (!Tools.isNullOrUndefined(data.data.active))
            if (x.status !== 1)
              return resolve(false);
          if (!Tools.isNullOrUndefined(data.data.status))
            if (data.data.status !== x.status)
              return resolve(false);
          if (!Tools.isNullOrUndefined(data.data.typeId))
            if (data.data.typeId !== x.servicePlanId)
              return resolve(false);
          if (Tools.isArray(data.data.typesId)) {
            let okay = false;
            for (const typeId of data.data.typesId) {
              if (typeId === x.servicePlanId) {
                okay = true;
                break;
              }
            }
            if (!okay)
              return resolve(false);
          }
          resolve(true);
        }).catch((x) => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetServicesByType, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServices().then(x => {
          let outlist = [];
          for (let ix of x) {
            if (data.data.ids.indexOf(ix.servicePlanId) >= 0)
              outlist.push(ix);
          }
          resolve(outlist);
        }).catch((x) => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetBankAccounts, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getClientBankAccount(data.data.id, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.AddBankAccount, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addClientBankAccount(data.data.clientId, data.data.obj).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.GetPayments, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getPayments(data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });
      features.log.info("UCRM Ready");
      resolve();
    });
  }
};