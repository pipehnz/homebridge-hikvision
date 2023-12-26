import { HikvisionApi, HikVisionNvrApiConfiguration } from "./HikvisionApi";
import { HikVisionCamera } from "./HikVisionCamera";
import { API, PlatformAccessory, PlatformConfig } from "homebridge";
export declare class HikVisionNVR {
    private homebridgeApi;
    private log;
    config: HikVisionNvrApiConfiguration;
    hikVisionApi: HikvisionApi;
    cameras: HikVisionCamera[];
    constructor(logger: any, config: PlatformConfig, api: API);
    loadAccessories(): Promise<void>;
    configureAccessory(accessory: PlatformAccessory): Promise<void>;
    private processHikVisionEvent;
    startMonitoring(): void;
}
//# sourceMappingURL=HikVisionNVR.d.ts.map