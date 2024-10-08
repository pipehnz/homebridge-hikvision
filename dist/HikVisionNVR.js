"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikVisionNVR = void 0;
const HikvisionApi_1 = require("./HikvisionApi");
const HikVisionCamera_1 = require("./HikVisionCamera");
const _1 = require(".");
class HikVisionNVR {
    constructor(logger, config, api) {
        this.hikVisionApi = new HikvisionApi_1.HikvisionApi(config);
        this.homebridgeApi = api;
        this.log = logger;
        this.config = config;
        this.cameras = [];
        this.log("Initializing accessories for HikVision...");
        this.homebridgeApi.on("didFinishLaunching", this.loadAccessories.bind(this));
    }
    loadAccessories() {
        return __awaiter(this, void 0, void 0, function* () {
            const systemInformation = yield this.hikVisionApi.getSystemInfo();
            this.log.info("Connected to NVR system: %O", systemInformation);
            this.log.info("Loading cameras...");
            const cameras = yield this.hikVisionApi.getCameras();
            this.log.debug("Found cameras: %s", JSON.stringify(cameras, null, 4));
            cameras.map((channel) => {
                const cameraConfig = {
                    accessory: "camera",
                    name: channel.name,
                    channelId: channel.id,
                    hasAudio: true,
                };
                const cameraUUID = this.homebridgeApi.hap.uuid.generate(_1.HIKVISION_PLUGIN_NAME + cameraConfig.name);
                const accessory = new this.homebridgeApi.platformAccessory(cameraConfig.name, cameraUUID);
                accessory.context = cameraConfig;
                // Only add new cameras that are not cached
                if (!this.cameras.find((x) => x.UUID === accessory.UUID)) {
                    this.configureAccessory(accessory); // abusing the configureAccessory here
                    this.homebridgeApi.registerPlatformAccessories(_1.HIKVISION_PLUGIN_NAME, _1.HIKVISION_PLATFORM_NAME, [accessory]);
                }
                return accessory;
            });
            this.log.info("Registering cameras with homebridge");
            // this.cameras = homebridgeCameras;
            // Remove cameras that were not in previous call
            // this.cameras.forEach((accessory: PlatformAccessory) => {
            //   if (!cameras.find((x: any) => x.uuid === accessory.UUID)) {
            //     this.homebridgeApi.unregisterPlatformAccessories(HIKVISION_PLUGIN_NAME, HIKVISION_PLATFORM_NAME, [accessory]);
            //   }
            // });
            this.startMonitoring();
        });
    }
    configureAccessory(accessory) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Configuring accessory ${accessory.displayName}`);
            accessory.context = Object.assign(accessory.context, this.config);
            const camera = new HikVisionCamera_1.HikVisionCamera(this.log, this.homebridgeApi, accessory);
            const cameraAccessoryInfo = camera.getService(this.homebridgeApi.hap.Service.AccessoryInformation);
            cameraAccessoryInfo.setCharacteristic(this.homebridgeApi.hap.Characteristic.Manufacturer, "HikVision");
            // cameraAccessoryInfo!.setCharacteristic(this.homebridgeApi.hap.Characteristic.Model, systemInformation.DeviceInfo.model);
            // cameraAccessoryInfo!.setCharacteristic(this.homebridgeApi.hap.Characteristic.SerialNumber, systemInformation.DeviceInfo.serialNumber);
            // cameraAccessoryInfo!.setCharacteristic(this.homebridgeApi.hap.Characteristic.FirmwareRevision, systemInformation.DeviceInfo.firmwareVersion);
            this.cameras.push(camera);
        });
    }
    processHikVisionEvent(event) {
        switch (event.EventNotificationAlert.eventType) {
            case "videoloss":
                this.log.info("videoloss, nothing to do...");
                break;
            case "fielddetection":
            case "linedetection":
            case "shelteralarm":
            case "VMD":
                const motionDetected = event.EventNotificationAlert.eventState === "active";
                const channelId = event.EventNotificationAlert.channelID;
                const camera = this.cameras.find((camera) => camera.accessory.context.channelId === channelId);
                if (!camera) {
                    return this.log.info("Could not find camera for event", event);
                }
                this.log.info("Motion detected on camera, triggering motion", camera.displayName, motionDetected, camera.motionDetected);
                if (motionDetected !== camera.motionDetected) {
                    camera.motionDetected = motionDetected;
                    const motionService = camera.getService(this.homebridgeApi.hap.Service.MotionSensor);
                    this.log.info(motionService, camera, camera.accessory);
                    motionService === null || motionService === void 0 ? void 0 : motionService.setCharacteristic(this.homebridgeApi.hap.Characteristic.MotionDetected, motionDetected);
                    setTimeout(() => {
                        var _a;
                        this.log.info("Disabling motion detection on camera", camera.displayName);
                        camera.motionDetected = !motionDetected;
                        (_a = camera
                            .getService(this.homebridgeApi.hap.Service.MotionSensor)) === null || _a === void 0 ? void 0 : _a.setCharacteristic(this.homebridgeApi.hap.Characteristic.MotionDetected, !motionDetected);
                    }, 10000);
                }
            default:
                this.log.info("event", event);
        }
    }
    startMonitoring() {
        this.hikVisionApi.startMonitoringEvents(this.processHikVisionEvent.bind(this));
    }
}
exports.HikVisionNVR = HikVisionNVR;
//# sourceMappingURL=HikVisionNVR.js.map