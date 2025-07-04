import axios, { AxiosRequestConfig } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AXIOS_INSTANCE = axios.create({
    baseURL: 'https://chapiritas.org/lana',
});

// 👇 Esta es la versión adaptada para usar AsyncStorage y bearer token
export const customInstance = async <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig
): Promise<T> => {
    const source = axios.CancelToken.source();

    const token = await AsyncStorage.getItem('access_token');

    const finalConfig: AxiosRequestConfig = {
        ...config,
        ...options,
        headers: {
            ...(config.headers || {}),
            ...(options?.headers || {}),
            Authorization: token ? `Bearer ${token}` : undefined,
        },
        cancelToken: source.token,
    };

    // Armar la URL completa (baseURL + endpoint) y mostrarla
    const fullUrl = `${AXIOS_INSTANCE.defaults.baseURL}${finalConfig.url}`;
    console.log(`📡 Llamando a: ${fullUrl}`);

    const promise = AXIOS_INSTANCE(finalConfig).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => source.cancel("Query was cancelled");

    return promise;
};
