import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from 'axios';

import { getRuntimeHeaders, runtime } from '../../runtime';

let proxyBaseUrl = runtime.getProxyBaseUrl();

function loadProxyPort() {
    proxyBaseUrl = runtime.getProxyBaseUrl();
}

function getProxyEndpoint() {
    const currentBaseUrl = runtime.getProxyBaseUrl() || proxyBaseUrl;
    if (!currentBaseUrl) {
        throw new Error('当前运行环境未配置可用的代理地址');
    }

    return `${currentBaseUrl}/proxy`;
}

function proxyRequest(
    method: string = 'GET',
    url: string,
    headers: object = {},
    data: any = null,
    responseType: ResponseType = 'json'
) {
    return new Promise<AxiosResponse>((resolve, reject) => {
        let requestUrl = '';

        try {
            requestUrl = getProxyEndpoint();
        }
        catch (error) {
            reject(error);
            return;
        }

        const options: AxiosRequestConfig = {
            method: 'POST',
            url: requestUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; text/plain; application/octet-stream; */*',
                ...getRuntimeHeaders()
            },
            data: {
                url: url,
                method: method,
                body: data,
                headers: headers,
                responseType: responseType
            },
            responseType: responseType
        };
        axios(options).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}

export {
    loadProxyPort,
    proxyRequest
};
