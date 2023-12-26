import { Service, WithUUID, API, PlatformAccessory } from "homebridge";
export declare class HikVisionCamera {
    log: any;
    config: any;
    any: any;
    camera?: any;
    motionDetected: boolean;
    homebridgeApi: API;
    displayName: string;
    UUID: string;
    accessory: any;
    constructor(log: any, homebridgeApi: API, accessory: PlatformAccessory);
    getService(...args: any[]): any;
    configureController(...args: any[]): any;
    addService(...args: any[]): any;
    removeService(...args: any[]): any;
    on(...args: any[]): void;
    getServiceByUUIDAndSubType<T extends WithUUID<typeof Service>>(uuid: string | T, subType: string): Service | undefined;
    configure(accessory: any): void;
}
//# sourceMappingURL=HikVisionCamera.d.ts.map