import {
  IUCRMServiceStatus,
  UCRM,
  UCRM_Client,
  UCRM_InvoiceAttribute,
  UCRM_InvoiceItem,
  UCRM_Service,
} from "./ucrm";
import { Service } from "./plugin";
import { CleanStringStrength, Tools } from "@bettercorp/tools";
import { fastify } from "@bettercorp/service-base-plugin-web-server";
import { MyPluginConfig } from "./sec.config";
import { IServerConfig } from "../../weblib";

export interface UCRMUISPOnEvents {
  onEvent(clientKey: string, event: any): Promise<void>;
}
export interface UCRMUISPOnReturnableEvents {
  verifyServer(clientKey: string): Promise<boolean>;
}
export interface UCRMUISPReturnableEvents {
  //crmGetInvoicePDF(clientId: string, invoiceId: string, onStream: { (stream: Readable): Promise<void>; }): Promise<any>;
  crm_addNewServiceForClient(
    config: IServerConfig,
    clientId: number,
    service: UCRM_Service
  ): Promise<any>;
  crm_addNewClient(config: IServerConfig, client: UCRM_Client): Promise<any>;
  crm_getPayments(config: IServerConfig, clientId?: number): Promise<any>;
  crm_getPaymentMethods(config: IServerConfig): Promise<any>;
  crm_getServices(
    config: IServerConfig,
    serviceId: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service>;
  crm_getServices(
    config: IServerConfig,
    serviceId?: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service[]>;
  crm_getServicesByAttribute(
    config: IServerConfig,
    attrKey: string,
    attrVal: string
  ): Promise<any>;
  crm_getServiceSurcharges(
    config: IServerConfig,
    serviceId: number
  ): Promise<any>;
  crm_getInvoices(
    config: IServerConfig,
    invoiceId?: number | undefined,
    clientId?: number | undefined
  ): Promise<any>;
  crm_getClient(
    config: IServerConfig,
    id?: number,
    offset?: number,
    limit?: number
  ): Promise<any>;
  crm_setClient(
    config: IServerConfig,
    id: number,
    data: UCRM_Client
  ): Promise<any>;
  crm_setService(
    config: IServerConfig,
    id: number,
    data: UCRM_Service
  ): Promise<any>;

  crm_addPayment(
    config: IServerConfig,
    clientId: number,
    methodId: string,
    amount: number,
    note: string,
    invoiceIds: number[],
    applyToInvoicesAutomatically: boolean,
    userId: number,
    additionalProps: any
  ): Promise<any>;
  crm_getClientBankAccount(
    config: IServerConfig,
    id: number,
    clientId: number
  ): Promise<any>;
  crm_addClientBankAccount(
    config: IServerConfig,
    clientId: number,
    data: any
  ): Promise<any>;
  crm_addNewInvoice(
    config: IServerConfig,
    items: UCRM_InvoiceItem[],
    attributes: UCRM_InvoiceAttribute[],
    maturityDays: number,
    invoiceTemplateId: number,
    clientId: number,
    applyCredit: boolean,
    proforma: boolean,
    adminNotes: string,
    notes: string
  ): Promise<any>;
  crm_sendInvoice(config: IServerConfig, invoiceId: string): Promise<any>;
  crm_getCountries(config: IServerConfig): Promise<any>;
  crm_getServicePlans(config: IServerConfig, serviceId: number): Promise<any>;
  crm_getServicePlanSurcharges(
    config: IServerConfig,
    serviceId: number,
    id: number
  ): Promise<any>;
  crm_getServicesByType(config: IServerConfig, ids: number[]): Promise<any>;
  crm_validateServiceForClient(
    config: IServerConfig,
    id: number,
    crmId: number,
    active?: boolean,
    status?: IUCRMServiceStatus,
    servicePlanIds?: number | number[]
  ): Promise<any>;
  crm_getInvoicePdf(
    config: IServerConfig,
    id: number,
    clientId: number,
    streamId: string
  ): Promise<void>;
}

export class UISP_UCRM {
  private uSelf: Service;
  constructor(uSelf: Service) {
    this.uSelf = uSelf;
  }
  private setupServer(
    hostname: string,
    key: string,
    organizationId?: number
  ): UCRM;
  private setupServer(serverConfig: IServerConfig): UCRM;
  private setupServer(
    serverConfigOrHostname: IServerConfig | string,
    key?: string,
    organizationId?: number
  ): UCRM {
    return new UCRM(
      Tools.isString(serverConfigOrHostname) && Tools.isString(key)
        ? {
            hostname: serverConfigOrHostname,
            key,
            organizationId: organizationId ?? 1,
          }
        : (serverConfigOrHostname as IServerConfig),
      this.uSelf.log
    );
  }
  async init(fastify: fastify, config: MyPluginConfig) {
    const self = this;
    if (config.webhooks === true) {
      await fastify.post(
        "/initrd/events/:id/",
        async (
          reply,
          params,
          body: {
            entityId: string;
            eventName: string;
            entity: string;
            extraData: {
              entity: {
                clientId: string;
              };
            };
          }
        ) => {
          await self.uSelf.log.info(
            `[CRM] {entity} changed for {clientId} ({eventName}-{entityId})`,
            {
              entity: body.entity,
              clientId: body.extraData.entity.clientId,
              eventName: body.eventName,
              entityId: body.entityId,
            }
          );

          let clientKey = Tools.cleanString(
            params.id,
            255,
            CleanStringStrength.soft
          );
          let knownServer = await self.uSelf.emitEventAndReturnTimed(
            "verifyServer",
            5,
            clientKey
          );
          if (!knownServer) {
            reply.status(404).send();
            return;
          }

          await self.uSelf.emitEvent("onEvent", clientKey, body);
          reply.status(200).send();
        }
      );
    }

    await self.uSelf.onReturnableEvent(
      "crm_addNewServiceForClient",
      async (
        config: IServerConfig,
        clientId: number,
        service: UCRM_Service
      ) => {
        return await self
          .setupServer(config)
          .addNewServiceForClient(service, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addNewClient",
      async (config: IServerConfig, client: UCRM_Client) => {
        return await self.setupServer(config).addNewClient(client);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getPayments",
      async (config: IServerConfig, clientId?: number) => {
        return await self.setupServer(config).getPayments(clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getPaymentMethods",
      async (config: IServerConfig) => {
        return await self.setupServer(config).getPaymentMethods();
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServices",
      async (
        config: IServerConfig,
        serviceId?: number,
        clientId?: number,
        status?: number,
        offset?: number,
        limit?: number
      ) => {
        return await self
          .setupServer(config)
          .getServices(serviceId, clientId, status, offset, limit);
      }
    );

    await self.uSelf.onReturnableEvent(
      "crm_getServicesByAttribute",
      async (config: IServerConfig, attrKey: string, attrVal: string) => {
        const server = self.setupServer(config);
        let services = await server.getServices(
          undefined,
          undefined,
          undefined
        ); // TODO: Specific active services ... no need to waste time lookup up non-active services
        for (let service of services) {
          if (Tools.isNullOrUndefined(service.attributes)) continue;
          for (let attr of service.attributes) {
            if (attr.key === attrKey && attr.value === attrVal) return service;
          }
        }
        return null;
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServiceSurcharges",
      async (config: IServerConfig, serviceId: number) => {
        return await self.setupServer(config).getServiceSurcharges(serviceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getInvoices",
      async (
        config: IServerConfig,
        invoiceId?: number | undefined,
        clientId?: number | undefined
      ) => {
        return await self.setupServer(config).getInvoices(invoiceId, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getClient",
      async (
        config: IServerConfig,
        id?: number,
        offset?: number,
        limit?: number
      ) => {
        return await self
          .setupServer(config)
          .getClient(id, undefined, offset, limit);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_setClient",
      async (config: IServerConfig, id: number, data: UCRM_Client) => {
        return await self.setupServer(config).setClient(id, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_setService",
      async (config: IServerConfig, id: number, data: UCRM_Service) => {
        return await self.setupServer(config).setService(id, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addPayment",
      async (
        config: IServerConfig,
        clientId: number,
        methodId: string,
        amount: number,
        note: string,
        invoiceIds: number[],
        applyToInvoicesAutomatically: boolean,
        userId: number,
        additionalProps: any
      ) => {
        return await self
          .setupServer(config)
          .addPayment(
            clientId,
            methodId,
            amount,
            note,
            invoiceIds,
            applyToInvoicesAutomatically,
            userId,
            additionalProps
          );
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getClientBankAccount",
      async (config: IServerConfig, id: number, clientId: number) => {
        return await self
          .setupServer(config)
          .getClientBankAccount(id, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addClientBankAccount",
      async (config: IServerConfig, clientId: number, data: any) => {
        return await self
          .setupServer(config)
          .addClientBankAccount(clientId, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addNewInvoice",
      async (
        config: IServerConfig,
        items: UCRM_InvoiceItem[],
        attributes: UCRM_InvoiceAttribute[],
        maturityDays: number,
        invoiceTemplateId: number,
        clientId: number,
        applyCredit: boolean,
        proforma: boolean,
        adminNotes: string,
        notes: string
      ) => {
        return await self
          .setupServer(config)
          .addNewInvoice(
            items,
            attributes,
            maturityDays,
            invoiceTemplateId,
            clientId,
            applyCredit,
            proforma,
            adminNotes,
            notes
          );
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_sendInvoice",
      async (config: IServerConfig, invoiceId: string) => {
        return await self.setupServer(config).sendInvoice(invoiceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getCountries",
      async (config: IServerConfig) => {
        return await self.setupServer(config).getCountries();
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicePlans",
      async (config: IServerConfig, serviceId: number) => {
        return await self.setupServer(config).getServicePlans(serviceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicePlanSurcharges",
      async (config: IServerConfig, serviceId: number, id: number) => {
        return await self
          .setupServer(config)
          .getServicePlanSurcharges(serviceId, id);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicesByType",
      async (config: IServerConfig, ids: number[]) => {
        return await self
          .setupServer(config)
          .getServices()
          .then((x) => {
            let outlist = [];
            for (let ix of x as Array<UCRM_Service>) {
              if (ids.indexOf(ix.servicePlanId) >= 0) outlist.push(ix);
            }
            return outlist;
          });
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_validateServiceForClient",
      async (
        config: IServerConfig,
        id: number,
        crmId: number,
        active?: boolean,
        status?: IUCRMServiceStatus,
        servicePlanIds?: number | number[]
      ) => {
        return await self
          .setupServer(config)
          .getServices(id, crmId)
          .then((x: any) => {
            if (Tools.isNullOrUndefined(x)) return false;
            if (!Tools.isNullOrUndefined(active))
              if (x.status !== IUCRMServiceStatus.Active) return false;
            if (!Tools.isNullOrUndefined(status))
              if (status !== x.status) return false;
            if (!Tools.isNullOrUndefined(servicePlanIds)) {
              if (Tools.isArray(servicePlanIds)) {
                let okay = false;
                for (const typeId of servicePlanIds) {
                  if (typeId === x.servicePlanId) {
                    okay = true;
                    break;
                  }
                }
                if (!okay) return false;
              } else if (servicePlanIds !== x.servicePlanId) return false;
            }
            return true;
          })
          .catch((x) => {
            throw x;
          });
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getInvoicePdf",
      async (
        config: IServerConfig,
        id: number,
        clientId: number,
        streamId: string
      ) => {
        const server = self.setupServer(config);
        let invoice: Array<any> | any = await server.getInvoices(id, clientId);
        if (Tools.isArray(invoice)) invoice = invoice[0];
        if (`${invoice.clientId}` !== `${clientId}`)
          throw `invoice (${id} != belong to ${clientId}) {${invoice.clientId}}`;
        await self.uSelf.sendStream(streamId, await server.getInvoicePdf(id));
        return;
      }
    );
  }
}
