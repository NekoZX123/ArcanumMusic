import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from "axios";

let proxyPort = 3000;
/**
 * 根据应用环境加载代理端口
 * 开发环境下应用加载后必须先调用
 */
function loadProxyPort() {
    window.electron.getAppEnvironment()
    .then((environment: string) => {
        if (environment === 'dev') {
            proxyPort = 3001;
        }
    });
}

/**
 * 本地代理网络请求 (`/app/service.js`, 
 * POST `localhost:3000/proxy` (build) / `localhost:3001/proxy` (dev))
 * 
 * @param method 请求类型
 * @param url 请求链接
 * @param data 请求数据
 * @param responseType 响应数据类型
 * @returns 请求结果
 */
function proxyRequest(method: string = 'GET', url: string, headers: object = {}, data: any = null, responseType: ResponseType = 'json') {
    return new Promise<AxiosResponse>((resolve, reject) => {
        const options: AxiosRequestConfig = {
            method: 'POST',
            url: `http://localhost:${proxyPort}/proxy`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; text/plain; application/octet-stream; */*'
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
            // console.log(response.data);
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
