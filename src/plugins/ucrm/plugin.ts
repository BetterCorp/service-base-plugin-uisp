import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { UCRM } from './ucrm';
import { IUCRMEvents } from '../../events';
import { IUCRMPluginConfig, IUNMSUCRMData } from '../../weblib';
import { IWebServerInitPlugin } from '@bettercorp/service-base-plugin-web-server/lib/plugins/express/config';
import { json as ExpressJSON, Response as ExpressResponse, Request as ExpressRequest } from 'express';
import * as crypto from 'crypto';
import * as cryptoJS from 'crypto-js';

export class Plugin implements IPlugin {
  init(features: PluginFeature): Promise<void> {
    return new Promise(async (resolve) => {
      if (features.getPluginConfig<IUCRMPluginConfig>().webhooks === true) {
        await features.initForPlugins<IWebServerInitPlugin, void>('plugin-express', 'use', {
          arg1: ExpressJSON({ limit: '5mb' })
        });
        features.initForPlugins('plugin-express', 'use', {
          arg1: async (req: ExpressRequest, res: any, next: Function) => {
            if (req.path.indexOf('/initrd/') !== 0) return next();
            features.log.debug(`REQ[${ req.method }] ${ req.path } (${ JSON.stringify(req.query) })`);
            res.setHeader('Access-Control-Allow-Origin', 'https://never.bettercorp.co.za/');
            res.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'POST'].join(','));
            res.setHeader('Access-Control-Allow-Headers', ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'authorization', 'session'].join(','));

            if (req.method.toUpperCase() === 'OPTIONS')
              return res.sendStatus(200);

            next();
          }
        });
        await features.initForPlugins<IWebServerInitPlugin, void>('plugin-express', 'post', {
          arg1: '/initrd/events/:id',
          arg2: async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
            try {
              let postBody = req.body;
              features.log.info(`[CRM] ${ postBody.entity } changed for ${ postBody.extraData.entity.clientId } (${ postBody.eventName }-${ postBody.entityId })`);

              let cleanedID = `${ req.params.id }`.replace(/(?![-])[\W]/g, '').trim().substr(0, 255);
              let knownServer = await features.emitEventAndReturn<String, Boolean>(null, IUCRMEvents.eventsGetServer + cleanedID, cleanedID);
              if (!knownServer) {
                res.sendStatus(404);
                return;
              }

              features.emitEvent(null, IUCRMEvents.eventsServer + cleanedID, postBody);
            } catch (exc) {
              res.sendStatus(404);
            }
          }
        });
      }

      if (features.getPluginConfig<IUCRMPluginConfig>().crmAPI === true) {
        features.initForPlugins('plugin-express', 'use', {
          arg1: async (req: any, res: any, next: Function) => {
            if (req.path.indexOf('/api/') !== 0) return next();
            features.log.debug(`REQ[${ req.method }] ${ req.path } (${ JSON.stringify(req.query) })`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'POST', 'GET'].join(','));
            res.setHeader('Access-Control-Allow-Headers', ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'authorization', 'session'].join(','));

            if (req.method.toUpperCase() === 'OPTIONS')
              return res.sendStatus(200);

            next();
          }
        });
        await features.initForPlugins<IWebServerInitPlugin, void>('plugin-express', 'get', {
          arg1: '/api/IVPDF/:hash',
          arg2: async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
            try {
              features.log.info(`[CRM] get INV PDF`);
              let base64Hash = decodeURIComponent(`${ req.params.hash }`).substr(0, 1024);
              let hash = Buffer.from(base64Hash, 'base64').toString('utf-8');
              let now = new Date();
              let checksum = decodeURIComponent(`${ req.query.checksum }`).substr(0, 1024);
              let secureKey = features.getPluginConfig<IUCRMPluginConfig>().clientKey + `-${ checksum }-${ now.getFullYear() }-${ now.getMonth() }-${ now.getDay() }-invoice-pdf`;

              let data = JSON.parse(Tools.decrypt(hash, secureKey));
              let randoHashChecksum = cryptoJS.SHA256(data.buffer).toString();
              if (randoHashChecksum !== checksum) throw 'Invalid checksum';

              features.log.info(`[CRM] ${ data.clientId } get ${ data.invoiceId } INV PDF`);
              new UCRM(data.server).getInvoicePdf(data.invoiceId, data.clientId).then((stream: any) => {
                stream.pipe(res);
              }).catch(x => {
                features.log.error(x);
                res.sendStatus(500);
              });
            } catch (exc) {
              features.log.error(exc);
              res.sendStatus(500);
            }
          }
        });

        features.onReturnableEvent(null, IUCRMEvents.getInvoicePdf, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
          if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
            return reject('Undefined variables passed in!');
          }
          let random = crypto.randomBytes(Math.floor((Math.random() * 100) + 1)).toString('hex');
          let randoHashChecksum = cryptoJS.SHA256(random).toString();
          let now = new Date();
          let secureKey = features.getPluginConfig<IUCRMPluginConfig>().clientKey + `-${ randoHashChecksum }-${ now.getFullYear() }-${ now.getMonth() }-${ now.getDay() }-invoice-pdf`;
          let hash = Tools.encrypt(JSON.stringify({
            server: data.server,
            clientId: data.data.clientId,
            invoiceId: data.data.invoiceId,
            buffer: random,
          }), secureKey);
          let base64Hash = Buffer.from(hash, 'utf-8').toString('base64');
          resolve({
            url: features.getPluginConfig<IUCRMPluginConfig>().myHost + `/api/IVPDF/${ encodeURIComponent(base64Hash) }?checksum=${ encodeURIComponent(randoHashChecksum) }`
          });
          /*NodeTools.getFileHash(filePipe).then(x => {
            resolve({
              url: features.getPluginConfig<IUCRMPluginConfig>().myHost + `/api/${data.data.clientId}/${data.data.invoiceId}`
            }).catch(reject);
          })*/
        });
      }

      features.onReturnableEvent(null, IUCRMEvents.addNewServiceForClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addNewServiceForClient(data.data.service,
          data.data.clientId).then(x => {
            resolve(x);
          }).catch(x => {
            reject(x);
          });
      });

      features.onReturnableEvent(null, IUCRMEvents.addNewClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addNewClient(data.data).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getPayments, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getPayments(data.data).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getPaymentMethods, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getPaymentMethods().then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getServices, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServices(data.data.serviceId, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getServicesByAttribute, async (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        try {
          let server = new UCRM(data.server);
          let services = await server.getServices(undefined, undefined, 1);
          for (let service of services) {
            if (Tools.isNullOrUndefined(service.attributes)) continue;
            for (let attr of service.attributes) {
              if (attr.key === data.data.attrKey && attr.value === data.data.attrVal)
                return resolve(service);
            }
          }
          return resolve(null);
        } catch (exc) {
          reject(exc);
        }
      });

      features.onReturnableEvent(null, IUCRMEvents.getServiceSurcharges, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServiceSurcharges(data.data.serviceId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getInvoices, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getInvoices(data.data.invoiceId, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getClient(data.data.id, data.data.emailOrPhoneNumber).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.setClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).setClient(data.data.id, data.data.data).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.addPayment, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addPayment(data.data.clientId, data.data.methodId
          , data.data.amount, data.data.note, data.data.invoiceIds,
          data.data.applyToInvoicesAutomatically, data.data.userId, data.data.additionalProps).then(x => {
            resolve(x);
          }).catch(x => {
            reject(x);
          });
      });

      features.onReturnableEvent(null, IUCRMEvents.getClientBankAccount, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getClientBankAccount(data.data.id, data.data.clientId).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.addClientBankAccount, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addClientBankAccount(data.data.clientId, data.data.data).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.addNewInvoice, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).addNewInvoice(data.data.items, data.data.attributes,
          data.data.maturityDays, data.data.invoiceTemplateId, data.data.clientId,
          data.data.applyCredit, data.data.proforma, data.data.adminNotes, data.data.notes
        ).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.sendInvoice, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).sendInvoice(data.data.id).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getServicePlans, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServicePlans(data.data.id).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });

      features.onReturnableEvent(null, IUCRMEvents.getServicePlanSurcharges, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
        if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
          return reject('Undefined variables passed in!');
        }
        new UCRM(data.server).getServicePlanSurcharges(data.data.serviceId, data.data.id).then(x => {
          resolve(x);
        }).catch(x => {
          reject(x);
        });
      });


      features.onReturnableEvent(null, IUCRMEvents.validateServiceForClient, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
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

      features.onReturnableEvent(null, IUCRMEvents.getServicesByType, (resolve: Function, reject: Function, data: IUNMSUCRMData) => {
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

      features.log.info("UCRM Ready");
      resolve();
    });
  }
};