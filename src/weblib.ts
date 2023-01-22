import _AXIOS from 'axios';
const AXIOS = _AXIOS as any;

export interface IUCRMPluginConfig {
  webhooks: boolean;
  //clientEncryptionKey: string;
  myHost: string;
}

export interface IUNMSPluginConfig {
  //webhooks: boolean;
  //clientEncryptionKey: string;
  //myHost: string;
}

export interface IServerConfig {
  hostname: string;
  key: string;
}

export interface IUNMSUCRMData<T = any> {
  data: T;
  server: IServerConfig;
}

// tslint:disable-next-line: max-line-length
export function webRequest(server: IServerConfig, basePath: string, path: string, method: string, params: Object | undefined = undefined, data: Object | undefined = undefined, additionalProps: Object | undefined = undefined) {
  return new Promise(async (resolve, reject) => {
    let newParams: Object = {};
    if (params !== undefined && params !== null) {
      newParams = params;
    }

    const url = `${ server.hostname }${ basePath }${ path }`;
    AXIOS({
      //timeout: 5000,
      url,
      params: newParams,
      method,
      data,
      headers: {
        'X-Auth-App-Key': server.key,
      },
      ...(additionalProps || {})
    }).then((x: any) => additionalProps !== undefined ? resolve(x) : resolve(x.data)).catch((e: any) => {
      console.error(e);
      reject(e);
    });
  });
}