import { Tools } from '@bettercorp/tools/lib/Tools';
import { IServerConfig, webRequest as CWR } from '../../weblib';
import moment = require('moment');
import { IDictionary } from '@bettercorp/tools/lib/Interfaces';
import { IPluginLogger } from '@bettercorp/service-base/lib/interfaces/logger';

export enum IUCRMDirection {
  Descending = 'DESC',
  Ascending = 'ASC'
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
  ProcessedProforma = 5
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
      self.webRequest(`/clients/services/${ serviceId }/service-surcharges${ Tools.isNullOrUndefined(id) ? '' : `/${ id }` }`, 'GET').then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  getServicePlans(id?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/service-plans${ Tools.isNullOrUndefined(id) ? '' : `/${ id }` }`, 'GET').then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }

  private webRequest(path: string, method: string, params: Object | undefined = undefined, data: Object | undefined = undefined, additionalProps: Object | undefined = undefined) {
    return CWR(this.ServerConfig, '/crm/api/v1.0', path, method, params, data, additionalProps);
  }

  addNewServiceForClient(service: UCRM_Service, clientId: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self.webRequest(`/clients/${ clientId }/services`, 'POST', undefined, service).then(resolve).catch(reject);
    });
  }
  addNewClient(client: UCRM_Client): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self.webRequest(`/clients`, 'POST', undefined, client).then(resolve).catch(reject);
    });
  }
  getPayments(clientId?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/payments${ clientId !== undefined ? `?clientId=${ clientId }&limit=10000` : '?limit=10000' }`, 'GET').then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  getPaymentMethods(): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/payment-methods`, 'GET').then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  getInvoicePdf(invoiceId: number, clientId: number): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getInvoices(invoiceId, clientId).then((invoiceObj: any) => {
        if (`${ invoiceObj.clientId }` !== `${ clientId }`)
          return reject(`NO AUTH (${ invoiceId } !=belong to ${ clientId }) {${ invoiceObj.clientId }}`);
        self.webRequest(`/invoices/${ invoiceId }/pdf`, 'GET', undefined, undefined, {
          responseType: 'stream'
        }).then((response: any) => {
          var writer = Tools.MemoryStream();
          response.data.pipe(writer);
          resolve(writer);
        }).catch(reject);
      }).catch(reject);
    });
  }
  getServices(serviceId?: number, clientId?: number, status?: number, offset: number = 0, limit: number = 10000): Promise<any[]> {
    let self = this;
    return new Promise((resolve, reject) => {
      self.webRequest((clientId !== undefined && clientId !== null && (serviceId === undefined || serviceId === null) ?
        `/clients/services?clientId=${ clientId }&offset=${ offset }&limit=${ limit }${ Tools.isNullOrUndefined(status) ? '' : `&statuses=${ status }` }` :
        `/clients/services${ serviceId !== undefined && serviceId !== null ?
          `/${ serviceId }?offset=${ offset }&limit=${ limit }` :
          `?offset=${ offset }&limit=${ limit }` }${ Tools.isNullOrUndefined(status) ? '' : `&statuses=${ status }` }`), 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  getServiceSurcharges(serviceId: number): Promise<any[]> {
    let self = this;
    return new Promise((resolve, reject) => {
      self.webRequest(`/clients/services/${ serviceId }/service-surcharges`, 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  getInvoices(invoiceId?: number, clientId?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      self.webRequest((clientId !== undefined && clientId !== null && (invoiceId === undefined || invoiceId === null) ? `/invoices?clientId=${ clientId }&limit=10000` : `/invoices${ invoiceId !== undefined && invoiceId !== null ? `/${ invoiceId }?limit=10000` : '?limit=10000' }`), 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  v2_getInvoices(query: UCRM_v2_GetInvoices): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      let req = `/invoices?`;
      if (Tools.isNullOrUndefined(query.id)) {
        let reqQRY = [];
        let simpleProps = ['clientId', 'createdDateFrom', 'createdDateTo', 'number', 'query', 'limit', 'offset', 'order', 'direction'];
        for (let prop of simpleProps) {
          if (!Tools.isNullOrUndefined((query as IDictionary<any>)[prop]))
            reqQRY.push(`${ prop }=${ encodeURIComponent((query as IDictionary<any>)[prop]) }`);
        }
        if (!Tools.isNullOrUndefined(query.overdue))
          reqQRY.push(`overdue=${ query.overdue ? '1' : '0' }`);
        if (!Tools.isNullOrUndefined(query.proforma))
          reqQRY.push(`proforma=${ query.proforma ? '1' : '0' }`);
        if (!Tools.isNullOrUndefined(query.statuses))
          for (let status of query.statuses!)
            reqQRY.push(`statuses[]=${ status }`);
        req += reqQRY.join('&');
      } else {
        req = `/invoices/${ query.id }`;
      }

      self.log.debug(req);
      self.webRequest(req, 'GET').then(x => resolve(x as Array<any>)).catch(reject);
    });
  }
  getClient(id?: number, emailOrPhoneNumber?: String): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (emailOrPhoneNumber === undefined || emailOrPhoneNumber === null)
        return self.webRequest(`/clients${ id ? `/${ id }` : '?limit=10000' }`, 'GET').then(x => resolve(x as Array<any> | any)).catch(reject);
      let tempEmailOrPhone = `${ emailOrPhoneNumber }`.toLowerCase();
      return self.webRequest(`/clients?limit=10000`, 'GET').then(async (x) => {
        for (let clientObj of (x as any[])) {
          let clientContacts = await self.webRequest(`/clients/${ clientObj.id }/contacts`, 'GET');
          for (let contactObj of (clientContacts as any[])) {
            if (contactObj.email !== undefined && contactObj.email !== null && `${ contactObj.email }`.toLowerCase() === tempEmailOrPhone) {
              return resolve(clientObj);
            }
            if (contactObj.phone !== undefined && contactObj.phone !== null && `${ contactObj.phone }`.toLowerCase() === tempEmailOrPhone) {
              return resolve(clientObj);
            }
          }
        }
        resolve(null);
      }).catch(reject);
    });
  }
  setClient(id: number, clientObj: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/clients/${ id }`, 'PATCH', undefined, clientObj).then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  addPayment(clientId: number, methodId: string, amount: number, note: string, invoiceIds?: number[], applyToInvoicesAutomatically?: boolean, userId?: number, additionalProps?: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      let nowFormat = moment().format();
      let sendObj: any = {
        clientId,
        amount,
        currencyCode: 'ZAR',
        userId,
        note,
        methodId,
        invoiceIds,
        createdDate: nowFormat,
        providerPaymentTime: nowFormat,
        ...(additionalProps || {})
      };
      return self.webRequest(`/payments`, 'POST', undefined, sendObj).then(async (x) => {
        resolve(x);
      }).catch(x=>reject(x.response.data || x));
    });
  }
  getClientBankAccount(id?: number, clientId?: number): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(id !== undefined ? `/clients/bank-accounts/${ id }` : `/clients/${ clientId }/bank-accounts`, 'GET').then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  addClientBankAccount(clientId: number, obj: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/clients/${ clientId }/bank-accounts`, 'POST', undefined, obj).then(async (x) => {
        resolve(x);
      }).catch(reject);
    });
  }
  addNewInvoice(items: Array<UCRM_InvoiceItem>, attributes: Array<UCRM_InvoiceAttribute>, maturityDays: number = 14,
    invoiceTemplateId: number, clientId: number, applyCredit: Boolean = true,
    proforma: boolean = false, adminNotes?: string, notes?: string): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/clients/${ clientId }/invoices`, 'POST', undefined, {
        items,
        attributes,
        maturityDays,
        invoiceTemplateId,
        applyCredit,
        proforma,
        adminNotes,
        notes
      }).then(async (x: any) => {
        resolve(x);
      }).catch(reject);
    });
  }
  sendInvoice(invoiceId: string): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      return self.webRequest(`/invoices/${ invoiceId }/send`, 'PATCH').then(async (x: any) => {
        resolve(x);
      }).catch(reject);
    });
  }
}

export interface IUCRM {
  addNewInvoice(items: Array<UCRM_InvoiceItem>, attributes: Array<UCRM_InvoiceAttribute>, maturityDays: number, invoiceTemplateId: number, clientId: number, applyCredit?: Boolean, proforma?: boolean, adminNotes?: string, notes?: string): Promise<any>;
  sendInvoice(invoiceId: string): Promise<any>;
  addNewServiceForClient(service: UCRM_Service, clientId: number): Promise<any>;
  addNewClient(client: UCRM_Client): Promise<any>;
  getPayments(clientId?: number): Promise<Array<any> | any>;
  getPaymentMethods(): Promise<Array<any> | any>;
  getInvoicePdf(invoiceId: number, clientId: number): Promise<any>;
  getServices(serviceId?: number, clientId?: number): Promise<Array<any>>;
  getServiceSurcharges(serviceId: number): Promise<Array<any>>;
  getInvoices(invoiceId?: number, clientId?: number): Promise<Array<any> | any>;
  getClient(id?: number, emailOrPhoneNumber?: String): Promise<Array<any> | any>;
  setClient(id: number, clientObj: any): Promise<Array<any> | any>;
  addPayment(clientId: number, methodId: string, amount: number, note: string, invoiceIds?: Array<number>, applyToInvoicesAutomatically?: boolean, userId?: number, additionalProps?: any): Promise<Array<any> | any>;
  getClientBankAccount(id?: number, clientId?: number): Promise<Array<any> | any>;
  addClientBankAccount(clientId: number, obj: any): Promise<Array<any> | any>;
  getServicePlans(id?: number): Promise<Array<any> | any>;
  getServicePlanSurcharges(serviceId?: number, id?: number): Promise<Array<any> | any>;
  //getTickets (id?: number): Promise<Array<any> | any>;
  //setTicket (ticketData: any, id?: number): Promise<any>;
  //getJobs (id?: number): Promise<Array<any> | any>;
  //setJob (jobData: any, id?: number): Promise<any>;
}

export class UCRM_Service {
  public servicePlanId: number | undefined = undefined;
  public servicePlanPeriodId: number | undefined = undefined;
  public activeFrom: Date | undefined = undefined;
  public activeTo: Date | undefined = undefined;
  public name: string | undefined = undefined;
  public price: number | undefined = undefined;
  public note: string | undefined = undefined;
  public invoicingStart: Date | undefined = undefined;
  public invoicingPeriodType: UCRM_Service_InvoicingPeriodType = UCRM_Service_InvoicingPeriodType.Forwards;
  public invoicingPeriodStartDay: number = 1;
  public nextInvoicingDayAdjustment: number | undefined = undefined;
  public invoicingProratedSeparately: boolean = true;
  public invoicingSeparately: boolean = false;
  public sendEmailsAutomatically: boolean = true;
  public useCreditAutomatically: boolean = true;
  public invoiceLabel: string | undefined = undefined;
  public street1: string | undefined = undefined;
  public street2: string | undefined = undefined;
  public city: string | undefined = undefined;
  public countryId: number | undefined = undefined;
  public stateId: number | undefined = undefined;
  public zipCode: string | undefined = undefined;
  public addressGpsLat: number | undefined = undefined;
  public addressGpsLon: number | undefined = undefined;
  public contractId: string | undefined = undefined;
  public contractLengthType: UCRM_Service_ContractLengthType = UCRM_Service_ContractLengthType.OpenEndContact;
  public minimumContractLengthMonths: number = 12;
  public contractEndDate: Date | undefined = undefined;
  public discountType: UCRM_Service_DiscountType = UCRM_Service_DiscountType.NoDiscount;
  public discountValue: number | undefined = undefined;
  public discountInvoiceLabel: string | undefined = undefined;
  public discountFrom: Date | undefined = undefined;
  public discountTo: Date | undefined = undefined;
  public tax1Id: number | undefined = undefined;
  public tax2Id: number | undefined = undefined;
  public tax3Id: number | undefined = undefined;
  public fccBlockId: string | undefined = undefined;
  public isQuoted: boolean = true;
}
export class UCRM_Client_Contact {
  public email: string | undefined = undefined;
  public phone: string | undefined = undefined;
  public name: string | undefined = undefined;
  public isBilling: boolean = true;
  public isContact: boolean = true;
}
export class UCRM_Client {
  public isLead: boolean = false;
  public clientType: UCRM_Client_Type = UCRM_Client_Type.Residential;
  public companyName: string | undefined = undefined;
  public companyRegistrationNumber: string | undefined = undefined;
  public companyTaxId: string | undefined = undefined;
  public companyWebsite: string | undefined = undefined;
  public companyContactFirstName: string | undefined = undefined;
  public companyContactLastName: string | undefined = undefined;
  public firstName: string | undefined = undefined;
  public lastName: string | undefined = undefined;
  public street1: string | undefined = undefined;
  public street2: string | undefined = undefined;
  public city: string | undefined = undefined;
  public zipCode: string | undefined = undefined;
  public note: string | undefined = undefined;
  public contacts: Array<UCRM_Client_Contact> = [];
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
  Company = 2
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