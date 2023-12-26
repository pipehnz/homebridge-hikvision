"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikVisionCamera = void 0;
// We borrow, rather cheekly from the homebridge-camera-ffmpeg plugin.
// TODO: probably rethink and do something like https://github.com/homebridge/homebridge-examples/tree/master/bridged-camera-example-typescript.
const streamingDelegate_1 = require("homebridge-camera-ffmpeg/dist/streamingDelegate");
const logger_1 = require("homebridge-camera-ffmpeg/dist/logger");
class HikVisionCamera {
    constructor(log, homebridgeApi, accessory) {
        this.motionDetected = false;
        this.log = log;
        this.homebridgeApi = homebridgeApi;
        this.accessory = accessory;
        this.displayName = this.accessory.displayName;
        this.UUID = accessory.UUID;
        this.configure(this.accessory);
    }
    getService(...args) {
        return this.accessory.getService(...args);
    }
    configureController(...args) {
        return this.accessory.configureController(...args);
    }
    addService(...args) {
        return this.accessory.addService(...args);
    }
    removeService(...args) {
        return this.accessory.removeService(...args);
    }
    on(...args) {
        this.accessory.on(...args);
    }
    getServiceByUUIDAndSubType(uuid, subType) {
        return undefined;
    }
    configure(accessory) {
        this.log.info("[HikvisionCamera] Configuring accessory: ", accessory.displayName);
        accessory.on("identify", () => {
            this.log(`${accessory.displayName} identified!`);
        });
        let motionSensor = accessory.getService(this.homebridgeApi.hap.Service.MotionSensor);
        if (motionSensor) {
            this.log.info("Re-creating motion sensor");
            accessory.removeService(motionSensor);
        }
        else {
            this.log.warn("There was no motion sensor set up!");
        }
        motionSensor = new this.homebridgeApi.hap.Service.MotionSensor(accessory.displayName);
        accessory.addService(motionSensor);
        const channelId = accessory.context.channelId;
        const cameraConfig = {
            name: accessory.displayName,
            videoConfig: {
                source: `-rtsp_transport tcp -i rtsp://${accessory.context.username}:${accessory.context.password}@${accessory.context.host}/Streaming/Channels/${channelId}02`,
                stillImageSource: `-i http${accessory.context.secure ? "s" : ""}://${accessory.context.username}:${accessory.context.password}@${accessory.context.host}/ISAPI/Streaming/channels/${channelId}01/picture?videoResolutionWidth=720`,
                maxFPS: 30, // TODO: pull this from the camera to avoid ever upsampling
                maxBitrate: 16384, // TODO: pull this from the camera to avoid ever upsampling
                maxWidth: 1920, // TODO: pull this from the camera to avoid ever upsampling
                vcodec: "libx264",
                audio: accessory.context.hasAudio,
                debug: Boolean(accessory.context.debugFfmpeg),
            },
        };
        const cameraLogger = new logger_1.Logger(this.log);
        // Use the homebridge-camera-ffmpeg StreamingDelegate.
        const streamingDelegate = new streamingDelegate_1.StreamingDelegate(cameraLogger, cameraConfig, this.homebridgeApi, this.homebridgeApi.hap, "");
        const cameraControllerOptions = {
            cameraStreamCount: 5, // HomeKit requires at least 2 streams, but 1 is also just fine
            delegate: streamingDelegate,
            streamingOptions: {
                supportedCryptoSuites: [
                    0 /* this.homebridgeApi.hap.SRTPCryptoSuites.AES_CM_128_HMAC_SHA1_80 */,
                ],
                video: {
                    resolutions: [
                        // TODO: put in the max framerates & resolutions from the camera config.
                        [320, 180, 30],
                        [320, 240, 15], // Apple Watch requires this configuration
                        [320, 240, 30],
                        [480, 270, 30],
                        [480, 360, 30],
                        [640, 360, 30],
                        [640, 480, 30],
                        [1280, 720, 30],
                        [1280, 960, 30],
                        [1920, 1080, 30],
                        [1600, 1200, 30],
                    ],
                    codec: {
                        profiles: [
                            0 /* this.homebridgeApi.hap.H264Profile.BASELINE */,
                            1 /* this.homebridgeApi.hap.H264Profile.MAIN */,
                            2 /* this.homebridgeApi.hap.H264Profile.HIGH */,
                        ],
                        levels: [
                            0 /* this.homebridgeApi.hap.H264Level.LEVEL3_1 */,
                            1 /* this.homebridgeApi.hap.H264Level.LEVEL3_2 */,
                            2 /* this.homebridgeApi.hap.H264Level.LEVEL4_0 */,
                        ],
                    },
                },
                audio: {
                    codecs: [
                        {
                            type: "OPUS" /* AudioStreamingCodecType.OPUS */,
                            samplerate: 24 /* AudioStreamingSamplerate.KHZ_24 */,
                        },
                        {
                            type: "AAC-eld" /* AudioStreamingCodecType.AAC_ELD */,
                            samplerate: 16 /* AudioStreamingSamplerate.KHZ_16 */,
                        },
                    ],
                },
            },
        };
        const cameraController = new this.homebridgeApi.hap.CameraController(cameraControllerOptions);
        accessory.configureController(cameraController);
    }
}
exports.HikVisionCamera = HikVisionCamera;
//# sourceMappingURL=HikVisionCamera.js.map