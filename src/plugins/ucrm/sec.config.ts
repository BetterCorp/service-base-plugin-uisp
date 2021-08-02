import * as crypto from 'crypto';
import { IUCRMPluginConfig } from '../../weblib';

export default (): IUCRMPluginConfig => {
  return {
    webhooks: false,
    crmAPI: false,
    clientEncryptionKey: crypto.pseudoRandomBytes(128).toString('hex'), // encrypt data that touches the client side
    myHost: 'http://localhost'
  };
};