import axios, { type AxiosResponse } from "axios";

/**
 * 本地代理网络请求 (`/app/service.js`, POST `localhost:3000/proxy`)
 * 
 * @param type 请求类型
 * @param link 请求链接
 * @param data 请求数据
 * @returns 
 */
function webRequest(type: string = 'get', link: string, headers: object = {}, data: any = null) {
    return new Promise<AxiosResponse>((resolve, reject) => {
        const options = {
            method: 'POST',
            url: `http://localhost:3000/proxy`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: {
                url: link,
                method: type,
                data: data,
                headers: headers
            },
        };
        axios(options).then((response) => {
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

export { webRequest };
