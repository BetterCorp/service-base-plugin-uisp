import { ServiceCallable } from "@bettercorp/service-base";
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
import { IServerConfig } from "../../weblib";

export class UCRMClient {
  //private uSelf: UISPClient;
  private _plugin: RegisteredPlugin<
    ServiceCallable,
    ServiceCallable,
    UISPReturnableEvents,
    ServiceCallable,
    ServiceCallable,
    any
  >;
  constructor(
    uSelf: UISPClient,
    _plugin: RegisteredPlugin<
      ServiceCallable,
      ServiceCallable,
      UISPReturnableEvents,
      ServiceCallable,
      ServiceCallable,
      any
    >
  ) {
    //this.uSelf = uSelf;
    this._plugin = _plugin;
  }

  public async addNewServiceForClient(
    config: IServerConfig,
    clientId: number,
    service: UCRM_Service
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewServiceForClient",
      config,
      clientId,
      service
    );
  }
  public async addNewClient(
    config: IServerConfig,
    client: UCRM_Client
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewClient",
      config,
      client
    );
  }
  public async getPayments(
    config: IServerConfig,
    clientId?: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getPayments",
      config,
      clientId
    );
  }
  public async getPaymentMethods(config: IServerConfig): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getPaymentMethods",
      config
    );
  }
  public async getService(
    config: IServerConfig,
    serviceId: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServices",
      config,
      serviceId,
      clientId,
      status,
      offset,
      limit
    );
  }
  public async getServices(
    config: IServerConfig,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<Array<UCRM_Service>> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServices",
      config,
      undefined,
      clientId,
      status,
      offset,
      limit
    );
  }
  public async getServiceSurcharges(
    config: IServerConfig,
    serviceId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServiceSurcharges",
      config,
      serviceId
    );
  }
  public async getInvoices(
    config: IServerConfig,
    invoiceId?: number | undefined,
    clientId?: number | undefined
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getInvoices",
      config,
      invoiceId,
      clientId
    );
  }
  public async getClient(config: IServerConfig): Promise<Array<UCRM_Client>>;
  public async getClient(
    config: IServerConfig,
    offset: number,
    limit: number
  ): Promise<Array<UCRM_Client>>;
  public async getClient(
    config: IServerConfig,
    id: number
  ): Promise<UCRM_Client>;
  public async getClient(
    config: IServerConfig,
    idOrOffset?: number,
    limit?: number
  ): Promise<UCRM_Client | Array<UCRM_Client>> {
    if (Tools.isNullOrUndefined(idOrOffset))
      return await this._plugin.emitEventAndReturn("crm_getClient", config);
    if (!Tools.isNullOrUndefined(limit))
      return await this._plugin.emitEventAndReturn(
        "crm_getClient",
        config,
        undefined,
        idOrOffset,
        limit
      );
    return await this._plugin.emitEventAndReturn(
      "crm_getClient",
      config,
      idOrOffset
    );
  }
  public async setClient(
    config: IServerConfig,
    id: number,
    data: UCRM_Client
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_setClient",
      config,
      id,
      data
    );
  }
  public async setService(
    config: IServerConfig,
    id: number,
    data: UCRM_Service
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_setService",
      config,
      id,
      data
    );
  }
  public async addPayment(
    config: IServerConfig,
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
      config,
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
    config: IServerConfig,
    id: number,
    clientId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getClientBankAccount",
      config,
      id,
      clientId
    );
  }
  public async addClientBankAccount(
    config: IServerConfig,
    clientId: number,
    data: any
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addClientBankAccount",
      config,
      clientId,
      data
    );
  }
  public async addNewInvoice(
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
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_addNewInvoice",
      config,
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
    config: IServerConfig,
    invoiceId: string
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_sendInvoice",
      config,
      invoiceId
    );
  }
  public async getCountries(config: IServerConfig): Promise<any> {
    return await this._plugin.emitEventAndReturn("crm_getCountries", config);
  }
  public async getServicePlans(
    config: IServerConfig,
    serviceId: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicePlans",
      config,
      serviceId
    );
  }
  public async getServicePlanSurcharges(
    config: IServerConfig,
    serviceId: number,
    id: number
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicePlanSurcharges",
      config,
      serviceId,
      id
    );
  }
  public async getServicesByType(
    config: IServerConfig,
    ids: number[]
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_getServicesByType",
      config,
      ids
    );
  }
  public async validateServiceForClient(
    config: IServerConfig,
    id: number,
    crmId: number,
    active?: boolean,
    status?: IUCRMServiceStatus,
    servicePlanIds?: number | number[]
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "crm_validateServiceForClient",
      config,
      id,
      crmId,
      active,
      status,
      servicePlanIds
    );
  }
  public async getInvoicePdf(
    config: IServerConfig,
    id: number,
    clientId: number,
    listener: { (error: Error | null, stream: Readable): Promise<void> }
  ): Promise<void> {
    const streamId = await this._plugin.receiveStream(listener, 30);
    return await this._plugin.emitEventAndReturnTimed(
      "crm_getInvoicePdf",
      35,
      config,
      id,
      clientId,
      streamId
    );
  }
}
