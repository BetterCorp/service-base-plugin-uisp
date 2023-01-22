import {
  IUCRMServiceStatus,
  UCRM,
  UCRM_Client,
  UCRM_InvoiceAttribute,
  UCRM_InvoiceItem,
  UCRM_Service,
} from "./ucrm";
import { Service } from "./plugin";
import { Tools } from "@bettercorp/tools";

export interface UCRMUISPReturnableEvents {
  //crmGetInvoicePDF(clientId: string, invoiceId: string, onStream: { (stream: Readable): Promise<void>; }): Promise<any>;
  crm_addNewServiceForClient(
    hostname: string,
    key: string,
    clientId: number,
    service: UCRM_Service
  ): Promise<any>;
  crm_addNewClient(
    hostname: string,
    key: string,
    client: UCRM_Client
  ): Promise<any>;
  crm_getPayments(
    hostname: string,
    key: string,
    clientId?: number
  ): Promise<any>;
  crm_getPaymentMethods(hostname: string, key: string): Promise<any>;
  crm_getServices(
    hostname: string,
    key: string,
    serviceId: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service>;
  crm_getServices(
    hostname: string,
    key: string,
    serviceId?: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service[]>;
  crm_getServicesByAttribute(
    hostname: string,
    key: string,
    attrKey: string,
    attrVal: string
  ): Promise<any>;
  crm_getServiceSurcharges(
    hostname: string,
    key: string,
    serviceId: number
  ): Promise<any>;
  crm_getInvoices(
    hostname: string,
    key: string,
    invoiceId?: number | undefined,
    clientId?: number | undefined
  ): Promise<any>;
  crm_getClient(
    hostname: string,
    key: string,
    id: number,
    offset?: number,
    limit?: number
  ): Promise<any>;
  crm_setClient(
    hostname: string,
    key: string,
    id: number,
    data: UCRM_Client
  ): Promise<any>;
  crm_setService(
    hostname: string,
    key: string,
    id: number,
    data: UCRM_Service
  ): Promise<any>;

  crm_addPayment(
    hostname: string,
    key: string,
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
    hostname: string,
    key: string,
    id: number,
    clientId: number
  ): Promise<any>;
  crm_addClientBankAccount(
    hostname: string,
    key: string,
    clientId: number,
    data: any
  ): Promise<any>;
  crm_addNewInvoice(
    hostname: string,
    key: string,
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
  crm_sendInvoice(
    hostname: string,
    key: string,
    invoiceId: string
  ): Promise<any>;
  crm_getCountries(hostname: string, key: string): Promise<any>;
  crm_getServicePlans(
    hostname: string,
    key: string,
    serviceId: number
  ): Promise<any>;
  crm_getServicePlanSurcharges(
    hostname: string,
    key: string,
    serviceId: number,
    id: number
  ): Promise<any>;
  crm_getServicesByType(
    hostname: string,
    key: string,
    ids: number[]
  ): Promise<any>;
  crm_validateServiceForClient(
    hostname: string,
    key: string,
    id: number,
    crmId: number,
    active?: boolean,
    status?: IUCRMServiceStatus,
    servicePlanIds?: number | number[]
  ): Promise<any>;
  crm_getInvoicePdf(
    hostname: string,
    key: string,
    id: number,
    clientId: number
  ): Promise<any>;
}

export class UISP_UCRM {
  private uSelf: Service;
  constructor(uSelf: Service) {
    this.uSelf = uSelf;
  }
  private setupServer(hostname: string, key: string): UCRM {
    return new UCRM({ hostname, key }, this.uSelf.log);
  }
  async init() {
    const self = this;
    await self.uSelf.onReturnableEvent(
      "crm_addNewServiceForClient",
      async (
        hostname: string,
        key: string,
        clientId: number,
        service: UCRM_Service
      ) => {
        return await self
          .setupServer(hostname, key)
          .addNewServiceForClient(service, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addNewClient",
      async (hostname: string, key: string, client: UCRM_Client) => {
        return await self.setupServer(hostname, key).addNewClient(client);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getPayments",
      async (hostname: string, key: string, clientId?: number) => {
        return await self.setupServer(hostname, key).getPayments(clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getPaymentMethods",
      async (hostname: string, key: string) => {
        return await self.setupServer(hostname, key).getPaymentMethods();
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServices",
      async (
        hostname: string,
        key: string,
        serviceId?: number,
        clientId?: number,
        status?: number,
        offset?: number,
        limit?: number
      ) => {
        return await self
          .setupServer(hostname, key)
          .getServices(serviceId, clientId, status, offset, limit);
      }
    );

    await self.uSelf.onReturnableEvent(
      "crm_getServicesByAttribute",
      async (
        hostname: string,
        key: string,
        attrKey: string,
        attrVal: string
      ) => {
        const server = self.setupServer(hostname, key);
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
      async (hostname: string, key: string, serviceId: number) => {
        return await self
          .setupServer(hostname, key)
          .getServiceSurcharges(serviceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getInvoices",
      async (
        hostname: string,
        key: string,
        invoiceId?: number | undefined,
        clientId?: number | undefined
      ) => {
        return await self
          .setupServer(hostname, key)
          .getInvoices(invoiceId, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getClient",
      async (
        hostname: string,
        key: string,
        id: number,
        offset?: number,
        limit?: number
      ) => {
        return await self
          .setupServer(hostname, key)
          .getClient(id, undefined, offset, limit);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_setClient",
      async (hostname: string, key: string, id: number, data: UCRM_Client) => {
        return await self.setupServer(hostname, key).setClient(id, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_setService",
      async (hostname: string, key: string, id: number, data: UCRM_Service) => {
        return await self.setupServer(hostname, key).setService(id, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addPayment",
      async (
        hostname: string,
        key: string,
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
          .setupServer(hostname, key)
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
      async (hostname: string, key: string, id: number, clientId: number) => {
        return await self
          .setupServer(hostname, key)
          .getClientBankAccount(id, clientId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addClientBankAccount",
      async (hostname: string, key: string, clientId: number, data: any) => {
        return await self
          .setupServer(hostname, key)
          .addClientBankAccount(clientId, data);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_addNewInvoice",
      async (
        hostname: string,
        key: string,
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
          .setupServer(hostname, key)
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
      async (hostname: string, key: string, invoiceId: string) => {
        return await self.setupServer(hostname, key).sendInvoice(invoiceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getCountries",
      async (hostname: string, key: string) => {
        return await self.setupServer(hostname, key).getCountries();
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicePlans",
      async (hostname: string, key: string, serviceId: number) => {
        return await self.setupServer(hostname, key).getServicePlans(serviceId);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicePlanSurcharges",
      async (hostname: string, key: string, serviceId: number, id: number) => {
        return await self
          .setupServer(hostname, key)
          .getServicePlanSurcharges(serviceId, id);
      }
    );
    await self.uSelf.onReturnableEvent(
      "crm_getServicesByType",
      async (hostname: string, key: string, ids: number[]) => {
        return await self
          .setupServer(hostname, key)
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
        hostname: string,
        key: string,
        id: number,
        crmId: number,
        active?: boolean,
        status?: IUCRMServiceStatus,
        servicePlanIds?: number | number[]
      ) => {
        return await self
          .setupServer(hostname, key)
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
      async (hostname: string, key: string, id: number, clientId: number) => {
        return await self
          .setupServer(hostname, key)
          .getInvoicePdf(id, clientId);
      }
    );
  }
}
