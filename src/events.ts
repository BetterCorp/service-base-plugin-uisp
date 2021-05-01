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

  eventsGetServer = 'get-server-events-',
  eventsServer = 'server-events-'
}

export enum IUNMSEvents {
  GetSites = "get-sites",
  GetDevices = "get-devices",
  GetDeviceStatistics = "get-device-statistics",
  GetTasks = "get-tasks",
  GetLogs = "get-logs",
}