import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { UCRM } from './ucrm';
import { IUCRMEvents } from '../../events';
import { IUNMSUCRMEmitter } from '../../weblib';

export class Plugin implements IPlugin {
  init (features: PluginFeature): Promise<void> {
    return new Promise((resolve) => {
      features.onEvent(null, IUCRMEvents.AddPayment, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).addPayment(arg.data.data.clientId,
          arg.data.data.paymentMethod,
          arg.data.data.amount,
          arg.data.data.note,
          arg.data.data.invoiceIds,
          arg.data.data.applyToInvoicesAutomatically,
          arg.data.data.userId,
          arg.data.data.additionalProps).then(x => {
            features.emitEvent(null, arg.resultNames.success, x);
          }).catch(x => {
            features.emitEvent(null, arg.resultNames.error, x);
          });
      });

      features.onEvent(null, IUCRMEvents.AddPayments, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).addPayment(arg.data.data.clientId, arg.data.data.method,
          arg.data.data.amount, arg.data.data.note, arg.data.data.invoiceIds, arg.data.data.applyToInvoicesAutomatically,
          arg.data.data.userId, arg.data.data.additionalProps).then(x => {
            features.emitEvent(null, arg.resultNames.success, x);
          }).catch(x => {
            features.emitEvent(null, arg.resultNames.error, x);
          });
      });

      features.onEvent(null, IUCRMEvents.GetClients, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getClient(arg.data.data.id, arg.data.data.email).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.GetInvoices, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getInvoices(arg.data.data.id, arg.data.data.clientId).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.GetServices, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getServices(arg.data.data.id, arg.data.data.clientId).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch(x => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.ValidateServiceAgainstClientId, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getServices(arg.data.data.id, arg.data.data.crmId).then(x => {
          features.emitEvent(null, arg.resultNames.success, !Tools.isNullOrUndefined(x));
        }).catch((x) => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.GetServicesByType, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getServices().then(x => {
          let outlist = [];
          for (let ix of x) {
            if (arg.data.data.ids.indexOf(ix.servicePlanId) >= 0)
              outlist.push(ix);
          }
          features.emitEvent(null, arg.resultNames.success, outlist);
        }).catch((x) => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.GetBankAccounts, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getClientBankAccount(arg.data.data.id, arg.data.data.clientId).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch((x) => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.AddBankAccount, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).addClientBankAccount(arg.data.data.clientId, arg.data.data.obj).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch((x) => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });

      features.onEvent(null, IUCRMEvents.GetPayments, (arg: IUNMSUCRMEmitter) => {
        if (Tools.isNullOrUndefined(arg.data) || Tools.isNullOrUndefined(arg.data.server) || Tools.isNullOrUndefined(arg.data.server.hostname) || Tools.isNullOrUndefined(arg.data.server.key)) {
          return features.emitEvent(null, arg.resultNames.error, 'Undefined variables passed in!');
        }
        new UCRM(arg.data.server).getPayments(arg.data.data.clientId).then(x => {
          features.emitEvent(null, arg.resultNames.success, x);
        }).catch((x) => {
          features.emitEvent(null, arg.resultNames.error, x);
        });
      });
      features.log.info("UCRM Ready");
      resolve();
    });
  }
};