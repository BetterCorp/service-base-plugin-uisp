import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IUCRMServiceStatus, UCRM, UCRM_v2_GetInvoices } from './ucrm';
import { IUCRMEvents } from '../../events';
import { IServerConfig, IUCRMPluginConfig, IUNMSUCRMData } from '../../weblib';
import { json as ExpressJSON, Response as ExpressResponse, Request as ExpressRequest } from 'express';
import * as crypto from 'crypto';
import * as cryptoJS from 'crypto-js';
import { express } from '@bettercorp/service-base-plugin-web-server/lib/plugins/express/express';

export interface IUCRMGetServer {

}
export interface IUCRMServerEvent {
  clientKey: string;
  data: any;
}

export type PromiseResolve<TData = any, TReturn = void> = (data: TData) => TReturn;
export class ucrm extends CPluginClient<IUCRMPluginConfig> {
  public readonly _pluginName: string = "ucrm";

  async onEventsVerifyServer(listener: (resolve: PromiseResolve<boolean, void>, reject: PromiseResolve<any, void>, clientKey: string) => void) {
    this.onReturnableEvent(IUCRMEvents.eventsVerifyServer, listener as any);
  };
  async onEventsGetServer(listener: (resolve: PromiseResolve<IServerConfig, void>, reject: PromiseResolve<any, void>, clientKey: string) => void) {
    this.onReturnableEvent(IUCRMEvents.eventsGetServer, listener as any);
  };
  async onEventsEmitServer(listener: (data: IUCRMServerEvent) => void) {
    this.onEvent(IUCRMEvents.eventsServer, listener as any);
  };
  async getInvoicePDFUrl(clientKey: string, clientId: string, invoiceId: string): Promise<string> {
    const self = this;
    return new Promise<string>((resolve, reject) => {
      self.emitEventAndReturn<any, any>(IUCRMEvents.getInvoicePdf, {
        data: {
          clientKey,
          clientId,
          invoiceId
        }
      }).then(x => resolve(x.url)).catch(reject);
    });
  }
  async getServicesByType(servicePlanIds: Array<string>, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServicesByType, {
      server,
      data: {
        ids: servicePlanIds
      }
    });
  }
  async validateServiceForClient(id: number, clientId: number, server: IServerConfig, active?: boolean, status?: IUCRMServiceStatus, servicePlanIds?: Array<number> | number) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.validateServiceForClient, {
      server,
      data: {
        id,
        crmId: clientId,
        active,
        status,
        servicePlanIds
      }
    });
  }
  async getServicePlanSurcharges(id: number, serviceId: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServicePlanSurcharges, {
      server,
      data: {
        id,
        serviceId
      }
    });
  }
  async getServices(server: IServerConfig, clientId?: number, serviceId?: number) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServices, {
      server,
      data: {
        clientId,
        serviceId
      }
    });
  }
  async getServicePlans(id: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServicePlans, {
      server,
      data: id
    });
  }
  async sendInvoice(id: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.sendInvoice, {
      server,
      data: id
    });
  }
  async getServiceSurcharges(serviceId: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServiceSurcharges, {
      server,
      data: serviceId
    });
  }
  async getPayments(clientId: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getPayments, {
      server,
      data: clientId
    });
  }
  async addClientBankAccount(clientId: number, bankData: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.addClientBankAccount, {
      server,
      data: {
        clientId,
        data: bankData
      }
    });
  }
  async getClientBankAccount(clientId: number, id: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getClientBankAccount, {
      server,
      data: {
        clientId,
        id
      }
    });
  }
  async addNewServiceForClient(clientId: number, service: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.addNewServiceForClient, {
      server,
      data: {
        clientId,
        service
      }
    });
  }
  async setClient(id: number, data: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.setClient, {
      server,
      data: {
        id,
        data
      }
    });
  }
  async getServicesByAttribute(attrKey: string, attrVal: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServicesByAttribute, {
      server,
      data: {
        attrKey,
        attrVal
      }
    });
  }
  async getClientById(id: number, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getClient, {
      server,
      data: {
        id
      }
    });
  }
  async getClientByAttr(emailOrPhoneNumber: string, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getClient, {
      server,
      data: {
        emailOrPhoneNumber
      }
    });
  }
  async addNewClient(clientData: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.addNewClient, {
      server,
      data: clientData
    });
  }
  async getInvoices(query: UCRM_v2_GetInvoices, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getInvoices, {
      server,
      data: query
    });
  }
  async addNewInvoice(clientId: number, items: Array<any>, attributes: Array<any>, maturityDays: number, invoiceTemplateId: number, applyCredit: boolean, proforma: boolean, adminNotes: string, notes: string, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.addNewInvoice, {
      server,
      data: {
        items,
        attributes,
        maturityDays,
        invoiceTemplateId,
        clientId,
        applyCredit,
        proforma,
        adminNotes,
        notes
      }
    });
  }
  async addPayment(clientId: number, methodId: string, amount: number, note: string, invoiceIds: Array<number>, applyToInvoicesAutomatically: boolean, userId: number, additionalProps: any, server: IServerConfig) {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.addPayment, {
      server,
      data: {
        clientId,
        methodId,
        amount,
        note,
        invoiceIds,
        applyToInvoicesAutomatically,
        userId,
        additionalProps
      }
    });
  }
}

export class Plugin extends CPlugin<IUCRMPluginConfig> {
  express!: express;

  init(): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      self.express = new express(self);

      if ((await self.getPluginConfig()).webhooks === true) {
        await self.initWebhooks();
      }

      if ((await self.getPluginConfig()).crmAPI === true) {
        await self.initCRMAPI();
      }

      await self.onReturnableEvent(null, IUCRMEvents.addNewServiceForClient, (a, b, c) => self.addNewServiceForClient(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.addNewClient, (a, b, c) => self.addNewClient(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getPayments, (a, b, c) => self.getPayments(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getPaymentMethods, (a, b, c) => self.getPaymentMethods(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServices, (a, b, c) => self.getServices(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServicesByAttribute, (a, b, c) => self.getServicesByAttribute(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServiceSurcharges, (a, b, c) => self.getServiceSurcharges(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getInvoices, (a, b, c) => self.getInvoices(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getClient, (a, b, c) => self.getClient(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.setClient, (a, b, c) => self.setClient(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.addPayment, (a, b, c) => self.addPayment(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getClientBankAccount, (a, b, c) => self.getClientBankAccount(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.addClientBankAccount, (a, b, c) => self.addClientBankAccount(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.addNewInvoice, (a, b, c) => self.addNewInvoice(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.sendInvoice, (a, b, c) => self.sendInvoice(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServicePlans, (a, b, c) => self.getServicePlans(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServicePlanSurcharges, (a, b, c) => self.getServicePlanSurcharges(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.validateServiceForClient, (a, b, c) => self.validateServiceForClient(a, b, c));
      await self.onReturnableEvent(null, IUCRMEvents.getServicesByType, (a, b, c) => self.getServicesByType(a, b, c));

      self.log.info("UCRM Ready");
      resolve();
    });
  }

  private addNewServiceForClient(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).addNewServiceForClient(data.data.service,
      data.data.clientId).then(x => {
        resolve(x);
      }).catch(x => {
        reject(x);
      });
  }

  private addNewClient(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).addNewClient(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getPayments(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getPayments(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getPaymentMethods(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getPaymentMethods().then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getServices(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServices(data.data.serviceId, data.data.clientId).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private async getServicesByAttribute(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    try {
      let server = new UCRM(data.server, this.log);
      let services = await server.getServices(undefined, undefined, undefined); // TODO: Specific active services ... no need to waste time lookup up non-active services
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
  }

  private getServiceSurcharges(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServiceSurcharges(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getInvoices(resolve: Function, reject: Function, data: IUNMSUCRMData<UCRM_v2_GetInvoices>) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).v2_getInvoices(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getClient(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getClient(data.data.id, data.data.emailOrPhoneNumber).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private setClient(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).setClient(data.data.id, data.data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private addPayment(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).addPayment(data.data.clientId, data.data.methodId
      , data.data.amount, data.data.note, data.data.invoiceIds,
      data.data.applyToInvoicesAutomatically, data.data.userId, data.data.additionalProps).then(x => {
        resolve(x);
      }).catch(x => {
        reject(x);
      });
  }

  private getClientBankAccount(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getClientBankAccount(data.data.id, data.data.clientId).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private addClientBankAccount(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).addClientBankAccount(data.data.clientId, data.data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private addNewInvoice(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).addNewInvoice(data.data.items, data.data.attributes,
      data.data.maturityDays, data.data.invoiceTemplateId, data.data.clientId,
      data.data.applyCredit, data.data.proforma, data.data.adminNotes, data.data.notes
    ).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private sendInvoice(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).sendInvoice(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getServicePlans(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServicePlans(data.data).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private getServicePlanSurcharges(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServicePlanSurcharges(data.data.serviceId, data.data.id).then(x => {
      resolve(x);
    }).catch(x => {
      reject(x);
    });
  }

  private validateServiceForClient(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServices(data.data.id, data.data.crmId).then((x: any) => {
      if (Tools.isNullOrUndefined(x))
        return resolve(false);
      if (!Tools.isNullOrUndefined(data.data.active))
        if (x.status !== IUCRMServiceStatus.Active)
          return resolve(false);
      if (!Tools.isNullOrUndefined(data.data.status))
        if (data.data.status !== x.status)
          return resolve(false);
      if (!Tools.isNullOrUndefined(data.data.servicePlanIds)) {
        if (Tools.isArray(data.data.servicePlanIds)) {
          let okay = false;
          for (const typeId of data.data.servicePlanIds) {
            if (typeId === x.servicePlanId) {
              okay = true;
              break;
            }
          }
          if (!okay)
            return resolve(false);
        } else if (data.data.servicePlanIds !== x.servicePlanId)
          return resolve(false);
      }
      resolve(true);
    }).catch((x) => {
      reject(x);
    });
  }

  private getServicesByType(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
      return reject('Undefined variables passed in!');
    }
    new UCRM(data.server, this.log).getServices().then(x => {
      let outlist = [];
      for (let ix of x) {
        if (data.data.ids.indexOf(ix.servicePlanId) >= 0)
          outlist.push(ix);
      }
      resolve(outlist);
    }).catch((x) => {
      reject(x);
    });
  }


  private async initWebhooks() {
    await this.express.use(ExpressJSON({ limit: '5mb' }));
    await this.express.use((a: any, b: any, c: any) => this.webHooksExpressCORS(a, b, c));
    await this.express.post('/initrd/events/:id', (a: any, b: any, c: any) => this.webHooksExpressEvent(a, b));
  }
  private async webHooksExpressCORS(req: ExpressRequest, res: any, next: Function) {
    if (req.path.indexOf('/initrd/') !== 0) return next();
    this.log.debug(`REQ[${ req.method }] ${ req.path } (${ JSON.stringify(req.query) })`);
    res.setHeader('Access-Control-Allow-Origin', 'https://never.bettercorp.co.za/');
    res.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'POST'].join(','));
    res.setHeader('Access-Control-Allow-Headers', ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'authorization', 'session'].join(','));

    if (req.method.toUpperCase() === 'OPTIONS')
      return res.sendStatus(200);

    next();
  }
  private async webHooksExpressEvent(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      let postBody = req.body;
      this.log.info(`[CRM] ${ postBody.entity } changed for ${ postBody.extraData.entity.clientId } (${ postBody.eventName }-${ postBody.entityId })`);

      let clientKey = `${ req.params.id }`.replace(/(?![-])[\W]/g, '').trim().substr(0, 255);
      let knownServer = await this.emitEventAndReturn<String, Boolean>(null, IUCRMEvents.eventsVerifyServer, clientKey);
      if (!knownServer) {
        res.sendStatus(404);
        return;
      }

      this.emitEvent<IUCRMServerEvent>(null, IUCRMEvents.eventsServer, {
        clientKey,
        data: postBody
      });
      res.sendStatus(202);
    } catch (exc) {
      this.log.error(exc);
      res.sendStatus(500);
    }
  }


  private async initCRMAPI() {
    await this.express.use((a: any, b: any, c: any) => this.crmAPIExpressCORS(a, b, c));
    await this.express.get('/api/IVPDF/:hash', (a: any, b: any, c: any) => this.crmAPIExpressGetPDF(a, b));

    this.onReturnableEvent(null, IUCRMEvents.getInvoicePdf, (a, b, c) => this.onCrmAPIGetInvoicePDF(a, b, c));
  }
  private async crmAPIExpressCORS(req: ExpressRequest, res: any, next: Function) {
    if (req.path.indexOf('/api/') !== 0) return next();
    this.log.debug(`REQ[${ req.method }] ${ req.path } (${ JSON.stringify(req.query) })`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'POST', 'GET'].join(','));
    res.setHeader('Access-Control-Allow-Headers', ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'authorization', 'session'].join(','));

    if (req.method.toUpperCase() === 'OPTIONS')
      return res.sendStatus(200);

    next();
  }
  private async crmAPIExpressGetPDF(req: ExpressRequest, res: any) {
    const self = this;
    try {
      self.log.info(`[CRM] get INV PDF`);
      let base64Hash = decodeURIComponent(`${ req.params.hash }`).substr(0, 1024);
      let hash = Buffer.from(base64Hash, 'base64').toString('utf-8');
      let now = new Date();
      let checksum = decodeURIComponent(`${ req.query.checksum }`).substr(0, 1024);
      let secureKey = (await self.getPluginConfig()).clientEncryptionKey + `-${ checksum }-${ now.getFullYear() }-${ now.getMonth() }-${ now.getDay() }-invoice-pdf`;

      let data = JSON.parse(Tools.decrypt(hash, secureKey));
      let randoHashChecksum = cryptoJS.SHA256(data.buffer).toString();
      if (randoHashChecksum !== checksum) throw 'Invalid checksum';

      self.log.info(`[CRM] ${ data.clientId } get ${ data.invoiceId } INV PDF`);
      let knownServer = await self.emitEventAndReturn<String, IServerConfig>(null, IUCRMEvents.eventsGetServer, data.clientKey);
      new UCRM(knownServer, self.log).getInvoicePdf(data.invoiceId, data.clientId).then((stream: any) => {
        stream.pipe(res);
      }).catch(x => {
        self.log.error(x);
        res.sendStatus(500);
      });
    } catch (exc) {
      self.log.error(exc);
      res.sendStatus(500);
    }
  }
  private async onCrmAPIGetInvoicePDF(resolve: Function, reject: Function, data: IUNMSUCRMData) {
    if (Tools.isNullOrUndefined(data)) {
      return reject('Undefined variables passed in!');
    }
    let random = crypto.randomBytes(Math.floor((Math.random() * 100) + 1)).toString('hex');
    let randoHashChecksum = cryptoJS.SHA256(random).toString();
    let now = new Date();
    let secureKey = (await this.getPluginConfig()).clientEncryptionKey + `-${ randoHashChecksum }-${ now.getFullYear() }-${ now.getMonth() }-${ now.getDay() }-invoice-pdf`;
    let hash = Tools.encrypt(JSON.stringify({
      clientKey: data.data.clientKey,
      clientId: data.data.clientId,
      invoiceId: data.data.invoiceId,
      buffer: random,
    }), secureKey);
    let base64Hash = Buffer.from(hash, 'utf-8').toString('base64');
    resolve({
      url: (await this.getPluginConfig()).myHost + `/api/IVPDF/${ encodeURIComponent(base64Hash) }?checksum=${ encodeURIComponent(randoHashChecksum) }`
    });
    /*NodeTools.getFileHash(filePipe).then(x => {
      resolve({
        url: features.getPluginConfig().myHost + `/api/${data.data.clientId}/${data.data.invoiceId}`
      }).catch(reject);
    })*/
  }
};