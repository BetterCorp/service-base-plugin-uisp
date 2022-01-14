export enum IUCRMEvents {
  addNewServiceForClient = "addNewServiceForClient",
  addNewClient = "addNewClient",
  getPayments = "getPayments",
  getPaymentMethods = "getPaymentMethods",
  getInvoicePdf = "getInvoicePdf",
  getServices = "getServices",
  getServicesByAttribute = "getServicesByAttribute",
  getServiceSurcharges = "getServiceSurcharges",
  getInvoices = "getInvoices",
  getClient = "getClient",
  setClient = "setClient",
  addPayment = "addPayment",
  getClientBankAccount = "getClientBankAccount",
  addClientBankAccount = "addClientBankAccount",
  addNewInvoice = "addNewInvoice",
  sendInvoice = "sendInvoice",
  getServicesByType = "getServicesByType",
  validateServiceForClient = "validateServiceForClient",
  getServicePlans = "getServicePlans",
  getServicePlanSurcharges = "getServicePlanSurcharges",

  eventsVerifyServer = 'verifyServerEvents-',
  eventsGetServer = 'getServerEvents-',
  eventsServer = 'serverEvents-'
}

export enum IUNMSEvents {
  getSites = "get-sites",
  getDevices = "get-devices",
  getDeviceStatistics = "get-device-statistics",
  getTasks = "get-tasks",
  getLogs = "get-logs",
}