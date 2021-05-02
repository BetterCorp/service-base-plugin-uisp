import * as crypto from 'crypto';
import { IUCRMPluginConfig } from '../../weblib';

export default (): IUCRMPluginConfig => {
  return {
    webhooks: false,
    crmAPI: false,
    events: false,
    clientKey: crypto.pseudoRandomBytes(64).toString('hex'),
    myHost: 'http://localhost'
  };
};