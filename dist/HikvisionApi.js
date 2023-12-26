"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikvisionApi = void 0;
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const axios_digest_1 = __importDefault(require("axios-digest"));
const xml2js_1 = __importStar(require("xml2js"));
const highland_1 = __importDefault(require("highland"));
class HikvisionApi {
    constructor(config) {
        const _axios = axios_1.default.create({
            baseURL: `http${config.secure ? "s" : ""}://${config.host}:${config.port}`,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: !config.ignoreInsecureTls,
            }),
            /*headers:{
              'CF-Access-Client-Id' : config.secure,
              'CF-Access-Client-Secret': config.cf_secrect,
            }*/
        });
        this._http = new axios_digest_1.default(config.username, config.password, _axios);
        this._parser = new xml2js_1.Parser({ explicitArray: false });
    }
    /*
      "DeviceInfo": {
      "$": {
        "version": "2.0",
        "xmlns": "http://www.isapi.org/ver20/XMLSchema"
      },
      "deviceName": "Network Video Recorder",
      "deviceID": "48443030-3637-3534-3837-f84dfcf8ef1c",
      "model": "DS-7608NI-I2/8P",
      "serialNumber": "DS-7608NI-I2/8P0820190316CCRRD00675487WCVU",
      "macAddress": "f8:4d:fc:f8:ef:1c",
      "firmwareVersion": "V4.22.005",
      "firmwareReleasedDate": "build 191208",
      "encoderVersion": "V5.0",
      "encoderReleasedDate": "build 191208",
      "deviceType": "NVR",
      "telecontrolID": "255"
    }
    */
    getSystemInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getResponse("/ISAPI/System/deviceInfo");
        });
    }
    getCameras() {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = yield this._getResponse("/ISAPI/System/Video/inputs/channels");
            for (let i = 0; i < channels.VideoInputChannelList.VideoInputChannel.length; i++) {
                const channel = channels.VideoInputChannelList.VideoInputChannel[i];
                if (channel.resDesc !== "NO VIDEO") {
                    channel.capabilities = yield this._getResponse(`/ISAPI/ContentMgmt/StreamingProxy/channels/${channel.id}01/capabilities`);
                }
                channel.status = { online: channel.resDesc !== "NO VIDEO" };
            }
            return channels.VideoInputChannelList.VideoInputChannel.filter((camera) => camera.status.online);
        });
    }
    startMonitoringEvents(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlParser = new xml2js_1.default.Parser({
                explicitArray: false,
            });
            /*
              EventNotificationAlert: {
                '$': { version: '2.0', xmlns: 'http://www.isapi.org/ver20/XMLSchema' },
                ipAddress: '10.0.1.186',
                portNo: '80',
                protocolType: 'HTTP',
                macAddress: 'f8:4d:fc:f8:ef:1c',
                dynChannelID: '1',
                channelID: '1',
                dateTime: '2020-02-19T18:44:4400:00',
                activePostCount: '1',
                eventType: 'fielddetection',
                eventState: 'active',
                eventDescription: 'fielddetection alarm',
                channelName: 'Front door',
                DetectionRegionList: { DetectionRegionEntry: [Object] }
              }
              */
            const url = `/ISAPI/Event/notification/alertStream`;
            // TODO: what do we do if we lose our connection to the NVR? Don't we need to re-connect?
            this.get(url, {
                responseType: "stream",
                headers: {},
            }).then((response) => {
                (0, highland_1.default)(response.data)
                    .map((chunk) => chunk.toString("utf8"))
                    .filter((text) => text.match(/<EventNotificationAlert/))
                    .map((xmlText) => xmlParser.parseStringPromise(xmlText.toString("utf8")))
                    .each((promise) => promise.then(callback));
            });
        });
    }
    get(url, config) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this._http) === null || _a === void 0 ? void 0 : _a.get(url, config);
        });
    }
    _getResponse(path) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield ((_a = this._http) === null || _a === void 0 ? void 0 : _a.get(path));
            const responseJson = yield ((_b = this._parser) === null || _b === void 0 ? void 0 : _b.parseStringPromise(response === null || response === void 0 ? void 0 : response.data.toString("utf8")));
            return responseJson;
        });
    }
}
exports.HikvisionApi = HikvisionApi;
//# sourceMappingURL=HikvisionApi.js.map