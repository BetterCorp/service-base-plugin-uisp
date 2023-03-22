import { Tools } from "@bettercorp/tools/lib/Tools";
import { IServerConfig, webRequest as CWR } from "../../weblib";
import moment = require("moment");
import { IDictionary } from "@bettercorp/tools/lib/Interfaces";
import { IPluginLogger } from "@bettercorp/service-base";

export enum IUCRMDirection {
  Descending = "DESC",
  Ascending = "ASC",
}
export enum IUCRMServiceStatus {
  Prepared = 0,
  Active = 1,
  Ended = 2,
  Suspended = 3,
  PreparedBlocked = 4,
  Obsolete = 5,
  Deferred = 6,
  Quoted = 7,
}
export enum IUCRMInvoiceStatus {
  Draft = 0,
  Unpaid = 1,
  PartiallyPaid = 2,
  Paid = 3,
  Void = 4,
  ProcessedProforma = 5,
}

export interface UCRM_v2_GetInvoices {
  id?: number;
  organizationId?: number;
  clientId?: number;
  createdDateFrom?: string;
  createdDateTo?: string;
  statuses?: Array<IUCRMInvoiceStatus>;
  number?: string;
  overdue?: boolean;
  proforma?: boolean;
  query?: string;
  limit?: number;
  offset?: number;
  order?: string;
  direction?: IUCRMDirection;
}

export interface UCRM_v2_GetInvoicePdf {
  id: number;
  clientId: number;
  streamId: string;
}

export class UCRM implements IUCRM {
  private ServerConfig: IServerConfig;
  private log: IPluginLogger;
  constructor(server: IServerConfig, log: IPluginLogger) {
    this.ServerConfig = server;
    this.log = log;
  }
  getServicePlanSurcharges(serviceId?: number, id?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(
          `/clients/services/${serviceId}/service-surcharges${
            Tools.isNullOrUndefined(id) ? "" : `/${id}`
          }`,
          "GET"
        )
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  getServicePlans(id?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(
          `/service-plans${Tools.isNullOrUndefined(id) ? "" : `/${id}`}`,
          "GET"
        )
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }

  private webRequest(
    path: string,
    method: string,
    params: Object | undefined = undefined,
    data: Object | undefined = undefined,
    additionalProps: Object | undefined = undefined
  ) {
    return CWR(
      this.ServerConfig,
      "/crm/api/v1.0",
      path,
      method,
      params,
      data,
      additionalProps
    );
  }

  addNewServiceForClient(
    service: UCRM_Service,
    clientId: number
  ): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(`/clients/${clientId}/services`, "POST", undefined, service)
        .then(resolve)
        .catch(reject);
    });
  }
  addNewClient(client: UCRM_Client): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(`/clients`, "POST", undefined, client)
        .then(resolve)
        .catch(reject);
    });
  }
  getPayments(clientId?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(
          `/payments${
            clientId !== undefined
              ? `?clientId=${clientId}&limit=10000`
              : "?limit=10000"
          }`,
          "GET"
        )
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  getPaymentMethods(): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/payment-methods`, "GET")
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  async getInvoicePdf(invoiceId: number): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(`/invoices/${invoiceId}/pdf`, "GET", undefined, undefined, {
          responseType: "stream",
        })
        .then((response: any) => {
          resolve(response.data);
        })
        .catch(reject);
    });
  }
  getServices(
    serviceId: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service>;
  getServices(
    serviceId?: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<Array<UCRM_Service>>;
  getServices(
    serviceId: number | undefined,
    clientId?: number,
    status?: number,
    offset: number = 0,
    limit: number = 10000
  ): Promise<UCRM_Service | Array<UCRM_Service>> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(
          clientId !== undefined &&
            clientId !== null &&
            (serviceId === undefined || serviceId === null)
            ? `/clients/services?clientId=${clientId}&offset=${offset}&limit=${limit}${
                Tools.isNullOrUndefined(status) ? "" : `&statuses=${status}`
              }`
            : `/clients/services${
                serviceId !== undefined && serviceId !== null
                  ? `/${serviceId}?offset=${offset}&limit=${limit}`
                  : `?offset=${offset}&limit=${limit}`
              }${Tools.isNullOrUndefined(status) ? "" : `&statuses=${status}`}`,
          "GET"
        )
        .then((x) => resolve(x as UCRM_Service | Array<UCRM_Service>))
        .catch(reject);
    });
  }
  getServiceSurcharges(serviceId: number): Promise<any[]> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(`/clients/services/${serviceId}/service-surcharges`, "GET")
        .then((x) => resolve(x as Array<any>))
        .catch(reject);
    });
  }
  getInvoices(invoiceId?: number, clientId?: number): Promise<Array<any>> {
    let self = this;
    return new Promise((resolve, reject) => {
      self
        .webRequest(
          clientId !== undefined &&
            clientId !== null &&
            (invoiceId === undefined || invoiceId === null)
            ? `/invoices?clientId=${clientId}&limit=10000`
            : `/invoices${
                invoiceId !== undefined && invoiceId !== null
                  ? `/${invoiceId}?limit=10000`
                  : "?limit=10000"
              }`,
          "GET"
        )
        .then((x) => resolve(x as Array<any>))
        .catch(reject);
    });
  }
  v2_getInvoices(query: UCRM_v2_GetInvoices): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      let req = `/invoices?`;
      if (Tools.isNullOrUndefined(query.id)) {
        let reqQRY = [];
        let simpleProps = [
          "clientId",
          "createdDateFrom",
          "createdDateTo",
          "number",
          "query",
          "limit",
          "offset",
          "order",
          "direction",
        ];
        for (let prop of simpleProps) {
          if (!Tools.isNullOrUndefined((query as IDictionary<any>)[prop]))
            reqQRY.push(
              `${prop}=${encodeURIComponent((query as IDictionary<any>)[prop])}`
            );
        }
        if (!Tools.isNullOrUndefined(query.overdue))
          reqQRY.push(`overdue=${query.overdue ? "1" : "0"}`);
        if (!Tools.isNullOrUndefined(query.proforma))
          reqQRY.push(`proforma=${query.proforma ? "1" : "0"}`);
        if (!Tools.isNullOrUndefined(query.statuses))
          for (let status of query.statuses!)
            reqQRY.push(`statuses[]=${status}`);
        req += reqQRY.join("&");
      } else {
        req = `/invoices/${query.id}`;
      }

      self.log.debug(req);
      self
        .webRequest(req, "GET")
        .then((x) => resolve(x as Array<any>))
        .catch(reject);
    });
  }
  getClient(
    id?: number,
    emailOrPhoneNumber?: string,
    offset: number = 0,
    limit: number = 1000
  ): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (Tools.isNullOrUndefined(emailOrPhoneNumber))
        return self
          .webRequest(
            `/clients${id ? `/${id}` : `?limit=${limit}&offset=${offset}`}`,
            "GET"
          )
          .then((x) => resolve(x as Array<any> | any))
          .catch(reject);

      let tempEmailOrPhone = `${emailOrPhoneNumber}`.toLowerCase();
      return self
        .webRequest(`/clients?limit=${limit}&offset=${offset}`, "GET")
        .then(async (x) => {
          for (let clientObj of x as any[]) {
            let clientContacts = await self.webRequest(
              `/clients/${clientObj.id}/contacts`,
              "GET"
            );
            for (let contactObj of clientContacts as any[]) {
              if (
                contactObj.email !== undefined &&
                contactObj.email !== null &&
                `${contactObj.email}`.toLowerCase() === tempEmailOrPhone
              ) {
                return resolve(clientObj);
              }
              if (
                contactObj.phone !== undefined &&
                contactObj.phone !== null &&
                `${contactObj.phone}`.toLowerCase() === tempEmailOrPhone
              ) {
                return resolve(clientObj);
              }
            }
          }
          resolve(null);
        })
        .catch(reject);
    });
  }
  setClient(id: number, clientObj: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/clients/${id}`, "PATCH", undefined, clientObj)
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  setService(id: number, serviceObj: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/clients/services/${id}`, "PATCH", undefined, serviceObj)
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  addPayment(
    clientId: number,
    methodId: string,
    amount: number,
    note: string,
    invoiceIds?: number[],
    applyToInvoicesAutomatically?: boolean,
    userId?: number,
    additionalProps?: any
  ): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      let nowFormat = moment().format();
      let sendObj: any = {
        clientId,
        amount,
        currencyCode: "ZAR",
        userId,
        note,
        methodId,
        invoiceIds,
        createdDate: nowFormat,
        providerPaymentTime: nowFormat,
        ...(additionalProps || {}),
      };
      return self
        .webRequest(`/payments`, "POST", undefined, sendObj)
        .then(async (x) => {
          resolve(x);
        })
        .catch((x) => reject(x.response.data || x));
    });
  }
  getClientBankAccount(id?: number, clientId?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(
          id !== undefined
            ? `/clients/bank-accounts/${id}`
            : `/clients/${clientId}/bank-accounts`,
          "GET"
        )
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  addClientBankAccount(clientId: number, obj: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(
          `/clients/${clientId}/bank-accounts`,
          "POST",
          undefined,
          obj
        )
        .then(async (x) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  addNewInvoice(
    items: Array<UCRM_InvoiceItem>,
    attributes: Array<UCRM_InvoiceAttribute>,
    maturityDays: number = 14,
    invoiceTemplateId: number,
    clientId: number,
    applyCredit: Boolean = true,
    proforma: boolean = false,
    adminNotes?: string,
    notes?: string
  ): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/clients/${clientId}/invoices`, "POST", undefined, {
          items,
          attributes,
          maturityDays,
          invoiceTemplateId,
          applyCredit,
          proforma,
          adminNotes,
          notes,
        })
        .then(async (x: any) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  sendInvoice(invoiceId: string): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/invoices/${invoiceId}/send`, "PATCH")
        .then(async (x: any) => {
          resolve(x);
        })
        .catch(reject);
    });
  }
  getCountries(): Promise<Array<UCRM_Country>> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self
        .webRequest(`/countries`, "GET")
        .then(async (x) => {
          resolve(x as any as Array<UCRM_Country>);
        })
        .catch(reject);
    });
  }
}

export interface IUCRM {
  addNewInvoice(
    items: Array<UCRM_InvoiceItem>,
    attributes: Array<UCRM_InvoiceAttribute>,
    maturityDays: number,
    invoiceTemplateId: number,
    clientId: number,
    applyCredit?: Boolean,
    proforma?: boolean,
    adminNotes?: string,
    notes?: string
  ): Promise<any>;
  sendInvoice(invoiceId: string): Promise<any>;
  addNewServiceForClient(service: UCRM_Service, clientId: number): Promise<any>;
  addNewClient(client: UCRM_Client): Promise<any>;
  getPayments(clientId?: number): Promise<Array<any> | any>;
  getPaymentMethods(): Promise<Array<any> | any>;
  getInvoicePdf(invoiceId: number, clientId: number): Promise<any>;
  getServices(
    serviceId?: number,
    clientId?: number,
    status?: number,
    offset?: number,
    limit?: number
  ): Promise<UCRM_Service | Array<UCRM_Service>>;
  getServiceSurcharges(serviceId: number): Promise<Array<any>>;
  getInvoices(invoiceId?: number, clientId?: number): Promise<Array<any> | any>;
  getClient(
    id?: number,
    emailOrPhoneNumber?: string,
    offset?: number,
    limit?: number
  ): Promise<Array<any> | any>;
  setClient(id: number, clientObj: any): Promise<Array<any> | any>;
  addPayment(
    clientId: number,
    methodId: string,
    amount: number,
    note: string,
    invoiceIds?: Array<number>,
    applyToInvoicesAutomatically?: boolean,
    userId?: number,
    additionalProps?: any
  ): Promise<Array<any> | any>;
  getClientBankAccount(
    id?: number,
    clientId?: number
  ): Promise<Array<any> | any>;
  addClientBankAccount(clientId: number, obj: any): Promise<Array<any> | any>;
  getServicePlans(id?: number): Promise<Array<any> | any>;
  getServicePlanSurcharges(
    serviceId?: number,
    id?: number
  ): Promise<Array<any> | any>;
  getServicePlanSurcharges(
    serviceId?: number,
    id?: number
  ): Promise<Array<any> | any>;
  setService(id: number, serviceObj: any): Promise<any>;
  getCountries(): Promise<Array<UCRM_Country>>;
  //getTickets (id?: number): Promise<Array<any> | any>;
  //setTicket (ticketData: any, id?: number): Promise<any>;
  //getJobs (id?: number): Promise<Array<any> | any>;
  //setJob (jobData: any, id?: number): Promise<any>;
}

export enum UCRM_ServicePlanType {
  Internet = "Internet",
  General = "General",
}
export enum UCRM_DiscountType {
  NoDiscount = 0,
  Percentage = 1,
  Fixed = 2,
}
export enum UCRM_ContractLengthType {
  OpenEnd = 1,
  CloseEnd = 2,
}
export enum UCRM_InvoicingPeriodType {
  Backwards = 1,
  Forwards = 2,
}
export enum UCRM_ServiceStatus {
  Prepared = 0,
  Active = 1,
  Ended = 2,
  Suspended = 3,
  PreparedBlocked = 4,
  Obsolete = 5,
  Deferred = 6,
  Quoted = 7,
}
export interface UCRM_Service {
  servicePlanPeriodId: number;
  activeFrom: string;
  activeTo?: string;
  name: string;
  price: number;
  note?: string;
  invoicingStart: string;
  invoicingPeriodType: UCRM_InvoicingPeriodType;
  invoicingPeriodStartDay: number;
  nextInvoicingDayAdjustment: number;
  invoicingProratedSeparately: boolean;
  invoicingSeparately: boolean;
  sendEmailsAutomatically: boolean;
  useCreditAutomatically: boolean;
  invoiceLabel: string;
  fullAddress: string;
  street1: string;
  street2: string;
  city: string;
  countryId: number;
  stateId?: number;
  zipCode: string;
  addressGpsLat: number;
  addressGpsLon: number;
  contractId: string;
  contractLengthType: UCRM_ContractLengthType;
  minimumContractLengthMonths: number;
  contractEndDate: string;
  discountType: UCRM_DiscountType;
  discountValue?: number;
  discountInvoiceLabel?: string;
  discountFrom?: string;
  discountTo?: string;
  tax1Id: number;
  tax2Id?: number;
  tax3Id?: number;
  id: number;
  servicePlanId: number;
  clientId: number;
  status: UCRM_ServiceStatus;
  fccBlockId?: string;
  hasIndividualPrice: boolean;
  totalPrice: number;
  servicePlanName: string;
  servicePlanPrice: number;
  servicePlanPeriod: number;
  servicePlanType: UCRM_ServicePlanType;
  downloadSpeed?: number;
  uploadSpeed?: number;
  currencyCode: string;
  hasOutage?: boolean;
  unmsClientSiteId?: string;
  lastInvoicedDate?: string;
  attributes: [
    {
      value: string;
      customAttributeId: number;
      id: string;
      serviceId: number;
      name: string;
      key: string;
      clientZoneVisible?: boolean;
    }
  ];
  suspensionReasonId?: number;
  serviceChangeRequestId?: string;
  setupFeePrice?: number;
  earlyTerminationFeePrice?: number;
  downloadSpeedOverride?: number;
  uploadSpeedOverride?: number;
  trafficShapingOverrideEnd?: string;
  trafficShapingOverrideEnabled?: boolean;
}

export enum UCRM_Service_InvoicingPeriodType {
  Backwards = 1,
  Forwards = 2,
}
export enum UCRM_Service_ContractLengthType {
  OpenEndContact = 1,
  CloseEndContract = 2,
}
export enum UCRM_Service_DiscountType {
  NoDiscount = 0,
  PercentageDiscount = 1,
  FixedDiscount = 2,
}
export enum UCRM_Client_Type {
  Residential = 1,
  Company = 2,
}
export interface UCRM_InvoiceItem {
  label: string;
  price: number;
  quantity: number;
  unit: string;
  tax1Id: number;
  tax2Id?: number;
  tax3Id?: number;
  productId?: number;
}
export interface UCRM_InvoiceAttribute {
  value: string;
  customAttributeId: number | null;
}
export interface UCRM_Country {
  id: number;
  name: string;
  code: string;
}

export interface UCRM_Client {
  id: number;
  userIdent: null | string;
  previousIsp: null | string;
  isLead: boolean;
  clientType: number;
  companyName: null | string;
  companyRegistrationNumber: null | string;
  companyTaxId: null | string;
  companyWebsite: null | string;
  street1: null | string;
  street2: null | string;
  city: null | string;
  countryId: number | null;
  stateId: number | null;
  zipCode: null | string;
  fullAddress: null | string;
  invoiceStreet1: null | string;
  invoiceStreet2: null | string;
  invoiceCity: null | string;
  invoiceStateId: null | number;
  invoiceCountryId: null | number;
  invoiceZipCode: null | number;
  invoiceAddressSameAsContact: boolean;
  note: null | string;
  sendInvoiceByPost: null | string;
  invoiceMaturityDays: null | number;
  stopServiceDue: null | string;
  stopServiceDueDays: null | number;
  organizationId: number;
  tax1Id: null | number;
  tax2Id: null | number;
  tax3Id: null | number;
  registrationDate: string;
  leadConvertedAt: null | string;
  companyContactFirstName: null | string;
  companyContactLastName: null | string;
  isActive: boolean;
  firstName: null | string;
  lastName: null | string;
  username: null | string;
  contacts: UCRM_Client_Contact[];
  attributes: UCRM_Client_Attribute[];
  accountBalance: number;
  accountCredit: number;
  accountOutstanding: number;
  currencyCode: string;
  organizationName: string;
  bankAccounts: UCRM_Client_BankAccount[];
  tags: UCRM_Client_Tag[];
  invitationEmailSentDate: null | string;
  avatarColor: string;
  addressGpsLat: number | null;
  addressGpsLon: number | null;
  isArchived: boolean;
  generateProformaInvoices: null | boolean;
  usesProforma: boolean;
  hasOverdueInvoice: boolean;
  hasOutage: boolean;
  hasSuspendedService: boolean;
  hasServiceWithoutDevices: boolean;
  referral: null | string;
  hasPaymentSubscription: boolean;
  hasAutopayCreditCard: boolean;
}

export interface UCRM_Client_Attribute {
  id: number;
  clientId: number;
  customAttributeId: number;
  name: string;
  key: string;
  value: string;
  clientZoneVisible: boolean;
}

export interface UCRM_Client_BankAccount {
  id: number;
  accountNumber: string;
}

export interface UCRM_Client_Contact {
  id: number;
  clientId: number;
  email: null | string;
  phone: null | string;
  name: null | string;
  isBilling: boolean;
  isContact: boolean;
  types: UCRM_Client_Contact_Type[];
}

export interface UCRM_Client_Contact_Type {
  id: number;
  name: UCRM_Client_TypeName;
}

export enum UCRM_Client_TypeName {
  Billing = "Billing",
  General = "General",
}

export interface UCRM_Client_Tag {
  id: number;
  name: string;
  colorBackground: string;
  colorText: string;
}
