import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/interfaces/plugins';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IUCRMServiceStatus, UCRM, UCRM_Client, UCRM_Service, UCRM_v2_GetInvoicePdf, UCRM_v2_GetInvoices } from './ucrm';
import { IUCRMEvents } from '../../events';
import { IServerConfig, IUCRMPluginConfig, IUNMSUCRMData } from '../../weblib';
import { json as ExpressJSON, Response as ExpressResponse, Request as ExpressRequest } from 'express';
import { express } from '@bettercorp/service-base-plugin-web-server/lib/plugins/express/express';
import { Readable } from 'stream';

export interface IUCRMServerEvent {
  clientKey: string;
  data: any;
}

export class ucrm extends CPluginClient<IUCRMPluginConfig> {
  public readonly _pluginName: string = "ucrm";

  async onEventsVerifyServer(listener: (clientKey?: string) => Promise<void>) {
    await this.onReturnableEvent<string, void>(IUCRMEvents.eventsVerifyServer, listener);
  };
  async onEventsGetServer(listener: (clientKey?: string) => Promise<void>) {
    await this.onReturnableEvent(IUCRMEvents.eventsGetServer, listener);
  };
  async onEventsEmitServer(listener: { (data: IUCRMServerEvent): Promise<void>; }) {
    await this.onEvent(IUCRMEvents.eventsServer, listener);
  };
  async getInvoicePDF(clientId: string, invoiceId: string, onStream: { (stream: Readable): Promise<void>; }): Promise<any> {
    const self = this;
    return new Promise<string>(async (resolve, reject) =>
      self.receiveStream((err, stream) => new Promise((resolveI, rejectI) => {
        if (err) return reject(err);
        onStream(stream).then(resolveI).catch(rejectI);
      }), 60).then(streamId =>
        self.emitEventAndReturn<any, any>(IUCRMEvents.getInvoicePdf, {
          data: {
            clientId,
            invoiceId,
            streamId
          }
        }).then(resolve).catch(reject)).catch(reject));
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
  async getServicesByService(server: IServerConfig, serviceId: number): Promise<UCRM_Service> {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServices, {
      server,
      data: {
        serviceId
      }
    });
  }
  async getServices(server: IServerConfig, offset: number, limit: number): Promise<Array<UCRM_Service>>;
  async getServices(server: IServerConfig, clientId: number): Promise<Array<UCRM_Service>>;
  async getServices(server: IServerConfig, clientIdOrOffset?: number, limit?: number): Promise<Array<UCRM_Service>> {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getServices, {
      server,
      data: {
        clientId: Tools.isNullOrUndefined(limit) ? clientIdOrOffset : undefined,
        offset: Tools.isNullOrUndefined(limit) ? undefined : clientIdOrOffset,
        limit
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
  async getClients(server: IServerConfig): Promise<Array<UCRM_Client>>;
  async getClients(server: IServerConfig, offset: number, limit: number): Promise<Array<UCRM_Client>>;
  async getClients(server: IServerConfig, id: number): Promise<UCRM_Client>;
  async getClients(server: IServerConfig, idOrOffset?: number, limit?: number): Promise<UCRM_Client | Array<UCRM_Client>> {
    return this.emitEventAndReturn<IUNMSUCRMData, any>(IUCRMEvents.getClient, {
      server,
      data: {
        id: Tools.isNullOrUndefined(limit) ? idOrOffset : undefined,
        offset: Tools.isNullOrUndefined(limit) ? undefined : idOrOffset,
        limit: limit
      }
    });
  }
  /*async getClientById(id: number, server: IServerConfig) {
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
  }*/
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
  private setupServer(data: IUNMSUCRMData): Promise<UCRM> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (Tools.isNullOrUndefined(data) || Tools.isNullOrUndefined(data.server) || Tools.isNullOrUndefined(data.server.hostname) || Tools.isNullOrUndefined(data.server.key)) {
        return reject('Undefined variables passed in!');
      }
      resolve(new UCRM(data.server, self.log));
    });
  }


  private addNewServiceForClient(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.addNewServiceForClient(data.data.service,
      data.data.clientId).then(resolve).catch(reject)).catch(reject));
  }
  private addNewClient(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.addNewClient(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getPayments(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getPayments(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getPaymentMethods(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getPaymentMethods().then(resolve).catch(reject)).catch(reject));
  }
  private getServices(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServices(data.data.serviceId, data.data.clientId, data.data.offset, data.data.limit).then(resolve).catch(reject)).catch(reject));
  }
  private getServicesByAttribute(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(async server => {
      try {
        let server = new UCRM(data.server, this.log);
        let services = (await server.getServices(undefined, undefined, undefined)) as Array<UCRM_Service>; // TODO: Specific active services ... no need to waste time lookup up non-active services
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
    }).catch(reject));
  }
  private getServiceSurcharges(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServiceSurcharges(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getInvoices(data: IUNMSUCRMData<UCRM_v2_GetInvoices>) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.v2_getInvoices(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getClient(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getClient(data.data.id, undefined, data.data.offset, data.data.limit).then(resolve).catch(reject)).catch(reject));
  }
  private setClient(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.setClient(data.data.id, data.data.data).then(resolve).catch(reject)).catch(reject));
  }
  private addPayment(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.addPayment(data.data.clientId, data.data.methodId
      , data.data.amount, data.data.note, data.data.invoiceIds,
      data.data.applyToInvoicesAutomatically, data.data.userId, data.data.additionalProps).then(resolve).catch(reject)).catch(reject));
  }
  private getClientBankAccount(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getClientBankAccount(data.data.id, data.data.clientId).then(resolve).catch(reject)).catch(reject));
  }
  private addClientBankAccount(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.addClientBankAccount(data.data.clientId, data.data.data).then(resolve).catch(reject)).catch(reject));
  }
  private addNewInvoice(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.addNewInvoice(data.data.items, data.data.attributes,
      data.data.maturityDays, data.data.invoiceTemplateId, data.data.clientId,
      data.data.applyCredit, data.data.proforma, data.data.adminNotes, data.data.notes
    ).then(resolve).catch(reject)).catch(reject));
  }
  private sendInvoice(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.sendInvoice(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getServicePlans(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServicePlans(data.data).then(resolve).catch(reject)).catch(reject));
  }
  private getServicePlanSurcharges(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServicePlanSurcharges(data.data.serviceId, data.data.id).then(resolve).catch(reject)).catch(reject));
  }
  private validateServiceForClient(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServices(data.data.id, data.data.crmId).then((x: any) => {
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
    })).catch(reject));
  }
  private getServicesByType(data: IUNMSUCRMData) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getServices().then(x => {
      let outlist = [];
      for (let ix of (x as Array<UCRM_Service>)) {
        if (data.data.ids.indexOf(ix.servicePlanId) >= 0)
          outlist.push(ix);
      }
      resolve(outlist);
    }).catch((x) => {
      reject(x);
    })).catch(reject));
  }
  private getInvoicePdf(data: IUNMSUCRMData<UCRM_v2_GetInvoicePdf>) {
    const self = this;
    return new Promise((resolve, reject) => self.setupServer(data).then(server => server.getInvoices(data.data.id).then(x => {
      if (Tools.isNullOrUndefined(x)) return reject('Cannot find invoice');
      server.getInvoicePdf(data.data.id, data.data.clientId).then((stream: any) => {
        self.sendStream(data.data.streamId, stream).then(resolve).catch(reject);
      }).catch(x => {
        self.log.error(x);
        reject(x);
      });
    }).catch((x) => {
      reject(x);
    })).catch(reject));
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

      let clientKey = `${ req.params.id }`.replace(/(?![-])[\W]/g, '').trim().substring(0, 255);
      let knownServer = await this.emitEventAndReturn<String, Boolean>(null, IUCRMEvents.eventsVerifyServer, clientKey);
      if (!knownServer) {
        res.sendStatus(404);
        return;
      }

      this.emitEvent<IUCRMServerEvent>(null, IUCRMEvents.eventsServer, {
        clientKey,
        data: postBody
      });
      res.sendStatus(200);
    } catch (exc) {
      this.log.error(exc);
      res.sendStatus(500);
    }
  }


  init(): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      if ((await self.getPluginConfig()).webhooks === true) {
        self.express = new express(self);
        await self.initWebhooks();
      }

      await self.onReturnableEvent(null, IUCRMEvents.addNewServiceForClient, (data) => self.addNewServiceForClient(data));
      await self.onReturnableEvent(null, IUCRMEvents.addNewClient, (data) => self.addNewClient(data));
      await self.onReturnableEvent(null, IUCRMEvents.getPayments, (data) => self.getPayments(data));
      await self.onReturnableEvent(null, IUCRMEvents.getPaymentMethods, (data) => self.getPaymentMethods(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServices, (data) => self.getServices(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServicesByAttribute, (data) => self.getServicesByAttribute(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServiceSurcharges, (data) => self.getServiceSurcharges(data));
      await self.onReturnableEvent(null, IUCRMEvents.getInvoices, (data) => self.getInvoices(data));
      await self.onReturnableEvent(null, IUCRMEvents.getClient, (data) => self.getClient(data));
      await self.onReturnableEvent(null, IUCRMEvents.setClient, (data) => self.setClient(data));
      await self.onReturnableEvent(null, IUCRMEvents.addPayment, (data) => self.addPayment(data));
      await self.onReturnableEvent(null, IUCRMEvents.getClientBankAccount, (data) => self.getClientBankAccount(data));
      await self.onReturnableEvent(null, IUCRMEvents.addClientBankAccount, (data) => self.addClientBankAccount(data));
      await self.onReturnableEvent(null, IUCRMEvents.addNewInvoice, (data) => self.addNewInvoice(data));
      await self.onReturnableEvent(null, IUCRMEvents.sendInvoice, (data) => self.sendInvoice(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServicePlans, (data) => self.getServicePlans(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServicePlanSurcharges, (data) => self.getServicePlanSurcharges(data));
      await self.onReturnableEvent(null, IUCRMEvents.validateServiceForClient, (data) => self.validateServiceForClient(data));
      await self.onReturnableEvent(null, IUCRMEvents.getServicesByType, (data) => self.getServicesByType(data));
      await self.onReturnableEvent(null, IUCRMEvents.getInvoicePdf, (data) => self.getInvoicePdf(data));

      self.log.info("UCRM Ready");
      resolve();
    });
  }
};