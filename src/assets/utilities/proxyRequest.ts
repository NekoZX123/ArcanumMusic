import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from "axios";

let proxyPort = 3000;
/**
 * 根据应用环境加载代理端口
 * 开发环境下应用加载后必须先调用
 */
async function loadProxyPort() {
    const environment = await window.electron.getAppEnvironment();
    if (environment === 'dev') {
        proxyPort = 3001;
    }
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
        }).catch((err) => {
            console.error(`Web request failed: ${err}`);
            reject(err);
        });
    });
}

/**
 * 获取流式代理链接
 * 将原音频 URL 转换为通过本地代理服务器流式传输的 URL
 * 用于需要渐进式播放的场景 (如 <audio> 标签的 src)
 *
 * @param originalUrl 原始音频 URL
 * @returns 本地代理的流式 URL
 */
function getProxyStreamUrl(originalUrl: string): string {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `http://localhost:${proxyPort}/proxy/stream?url=${encodedUrl}`;
}

/**
 * 获取当前代理端口
 */
function getProxyPort(): number {
    return proxyPort;
}

export {
    loadProxyPort,
    proxyRequest,
    getProxyStreamUrl,
    getProxyPort
};
