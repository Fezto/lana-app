import axios, { AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = axios.create({
    baseURL: 'http://192.168.100.2:8000'
});

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig
): Promise<T> => {
    const source = axios.CancelToken.source();

    const finalConfig = {
        ...config,
        ...options,
        cancelToken: source.token
    };

    // Armar la URL completa (baseURL + endpoint) y mostrarla
    const fullUrl = `${AXIOS_INSTANCE.defaults.baseURL}${finalConfig.url}`;
    console.log(`📡 Llamando a: ${fullUrl}`);

    const promise = AXIOS_INSTANCE(finalConfig).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => source.cancel("Query was cancelled");

    return promise;
};
