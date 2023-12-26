import { AxiosResponse, AxiosRequestConfig } from "axios";
import { PlatformConfig } from "homebridge";
export interface HikVisionNvrApiConfiguration extends PlatformConfig {
    host: string;
    port: Number;
    secure: boolean;
    ignoreInsecureTls: boolean;
    username: string;
    password: string;
    debugFfmpeg: boolean;
    cf_id: string;
    cf_secrect: string;
}
export declare class HikvisionApi {
    private _http?;
    private _parser?;
    constructor(config: HikVisionNvrApiConfiguration);
    getSystemInfo(): Promise<any>;
    getCameras(): Promise<any>;
    startMonitoringEvents(callback: (value: any) => any): Promise<void>;
    get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse | undefined>;
    private _getResponse;
}
//# sourceMappingURL=HikvisionApi.d.ts.map