export enum IUCRMEvents {
  GetClients = "get-clients",
  AddPayment = "add-payment",
  AddPayments = "add-payment",
  GetInvoices = "get-invoices",
  GetServices = "get-services",
  ValidateServiceAgainstClientId = "validate-serviceid-against-crmid",
  GetServicesByType = "get-services-of-types",
  GetBankAccounts = "get-bank-accounts",
  AddBankAccount = "add-bank-account",
  GetPayments = "get-payments"
}

export enum IUNMSEvents {
  GetSites = "get-sites",
  GetDevices = "get-devices",
  GetDeviceStatistics = "get-device-statistics",
  GetTasks = "get-tasks",
  GetLogs = "get-logs",
}