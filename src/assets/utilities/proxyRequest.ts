import axios, { type AxiosResponse } from "axios";

/**
 * 本地代理网络请求 (`/app/service.js`, POST `localhost:3000/proxy`)
 * 
 * @param method 请求类型
 * @param url 请求链接
 * @param data 请求数据
 * @returns 请求结果
 */
function proxyRequest(method: string = 'GET', url: string, headers: object = {}, data: any = null) {
    return new Promise<AxiosResponse>((resolve, reject) => {
        const options = {
            method: 'POST',
            url: `http://localhost:3000/proxy`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: {
                url: url,
                method: method,
                body: data,
                headers: headers
            },
        };
        axios(options).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}

export { proxyRequest };
