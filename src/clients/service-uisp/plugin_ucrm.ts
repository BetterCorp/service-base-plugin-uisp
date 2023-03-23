import { ServiceCallable } from "@bettercorp/service-base";
import { MyPluginConfig } from "../../plugins/service-uisp/sec.config";
import { UISPReturnableEvents } from "../../plugins/service-uisp/plugin";
import {
  IUCRMServiceStatus,
  UCRM_Client,
  UCRM_InvoiceAttribute,
  UCRM_InvoiceItem,
  UCRM_Service,
} from "../../plugins/service-uisp/ucrm";
import { RegisteredPlugin } from "@bettercorp/service-base/lib/service/serviceClient";
import { UISPClient } from "./plugin";
import { Readable } from "stream";
import { Tools } from "@bettercorp/tools";

export class UCRMClient {
  //private uSelf: UISPClient;
  private _plugin: RegisteredPlugin<
    ServiceCallable,
    ServiceCallable,
    UISPReturnableEvents,
    ServiceCallable,
    ServiceCallable,
    MyPluginConfig
  >;
  constructor(
    uSelf: UISPClient,
    _plugin: RegisteredPlugin<
      ServiceCallable,
      ServiceCallable,
      UISPReturnableEvents,
      ServiceCallable,
      ServiceCallable,
      MyPluginConfig
    >
  ) {
    //this.uSelf = uSelf;
    this._plugin = _plugin;
  }

  public async addNewServiceForClient(
    hostname: string,
    key: string,
    clientId: number,
    service: UCRM_Service
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewServiceForClient",
      hostname,
      key,
      clientId,
      service
    );
  }
  public async addNewClient(
    hostname: string,
    key: string,
    client: UCRM_Client
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewClient",
      hostname,
      key,
      client
    );
  }
  public async getPayments(
    hostname: string,
    key: string,
    clientId?: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getPayments",
      hostname,
      key,
      clientId
    );
  }
  public async getPaymentMethods(hostname: string, key: string): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getPaymentMethods",
      hostname,
      key
    );
  }
  public async getService(
    hostname: string,
    key: string,
    serviceId: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServices",
      hostname,
      key,
      serviceId,
      clientId,
      status,
      offset,
      limit
    );
  }
  public async getServices(
    hostname: string,
    key: string,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<Array<UCRM_Service>> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServices",
      hostname,
      key,
      undefined,
      clientId,
      status,
      offset,
      limit
    );
  }
  public async getServiceSurcharges(
    hostname: string,
    key: string,
    serviceId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServiceSurcharges",
      hostname,
      key,
      serviceId
    );
  }
  public async getInvoices(
    hostname: string,
    key: string,
    invoiceId?: number | undefined,
    clientId?: number | undefined
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getInvoices",
      hostname,
      key,
      invoiceId,
      clientId
    );
  }
  public async getClient(
    hostname: string,
    key: string
  ): Promise<Array<UCRM_Client>>;
  public async getClient(
    hostname: string,
    key: string,
    offset: number,
    limit: number
  ): Promise<Array<UCRM_Client>>;
  public async getClient(
    hostname: string,
    key: string,
    id: number
  ): Promise<UCRM_Client>;
  public async getClient(
    hostname: string,
    key: string,
    idOrOffset?: number,
    limit?: number
  ): Promise<UCRM_Client | Array<UCRM_Client>> {
    if (Tools.isNullOrUndefined(idOrOffset))
      return await this._plugin.emitEventAndReturn(
        "crm_getClient",
        hostname,
        key
      );
    if (!Tools.isNullOrUndefined(limit))
      return await this._plugin.emitEventAndReturn(
        "crm_getClient",
        hostname,
        key,
        undefined,
        idOrOffset,
        limit
      );
    return await this._plugin.emitEventAndReturn(
      "crm_getClient",
      hostname,
      key,
      idOrOffset
    );
  }
  public async setClient(
    hostname: string,
    key: string,
    id: number,
    data: UCRM_Client
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_setClient",
      hostname,
      key,
      id,
      data
    );
  }
  public async setService(
    hostname: string,
    key: string,
    id: number,
    data: UCRM_Service
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_setService",
      hostname,
      key,
      id,
      data
    );
  }
  public async addPayment(
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
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addPayment",
      hostname,
      key,
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
  public async getClientBankAccount(
    hostname: string,
    key: string,
    id: number,
    clientId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getClientBankAccount",
      hostname,
      key,
      id,
      clientId
    );
  }
  public async addClientBankAccount(
    hostname: string,
    key: string,
    clientId: number,
    data: any
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addClientBankAccount",
      hostname,
      key,
      clientId,
      data
    );
  }
  public async addNewInvoice(
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
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewInvoice",
      hostname,
      key,
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
  public async sendInvoice(
    hostname: string,
    key: string,
    invoiceId: string
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_sendInvoice",
      hostname,
      key,
      invoiceId
    );
  }
  public async getCountries(hostname: string, key: string): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getCountries",
      hostname,
      key
    );
  }
  public async getServicePlans(
    hostname: string,
    key: string,
    serviceId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicePlans",
      hostname,
      key,
      serviceId
    );
  }
  public async getServicePlanSurcharges(
    hostname: string,
    key: string,
    serviceId: number,
    id: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicePlanSurcharges",
      hostname,
      key,
      serviceId,
      id
    );
  }
  public async getServicesByType(
    hostname: string,
    key: string,
    ids: number[]
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicesByType",
      hostname,
      key,
      ids
    );
  }
  public async validateServiceForClient(
    hostname: string,
    key: string,
    id: number,
    crmId: number,
    active?: boolean,
    status?: IUCRMServiceStatus,
    servicePlanIds?: number | number[]
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_validateServiceForClient",
      hostname,
      key,
      id,
      crmId,
      active,
      status,
      servicePlanIds
    );
  }
  public async getInvoicePdf(
    hostname: string,
    key: string,
    id: number,
    clientId: number,
    listener: { (error: Error | null, stream: Readable): Promise<void> }
  ): Promise<void> {
    const streamId = await this._plugin.receiveStream(listener, 30);
    return await this._plugin.emitEventAndReturnTimed(
      "crm_getInvoicePdf",
      35,
      hostname,
      key,
      id,
      clientId,
      streamId
    );
  }
}
