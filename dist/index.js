"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIKVISION_PLATFORM_NAME = exports.HIKVISION_PLUGIN_NAME = void 0;
const HikVisionNVR_1 = require("./HikVisionNVR");
exports.HIKVISION_PLUGIN_NAME = "homebridge-plugin-hikvision";
exports.HIKVISION_PLATFORM_NAME = "Hikvision";
function main(api) {
    api.registerPlatform(exports.HIKVISION_PLUGIN_NAME, exports.HIKVISION_PLATFORM_NAME, HikVisionNVR_1.HikVisionNVR);
}
exports.default = main;
//# sourceMappingURL=index.js.map