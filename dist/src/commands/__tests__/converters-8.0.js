"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V8_0CommandConverters = void 0;
const __1 = require("../..");
exports.V8_0CommandConverters = {
    SSrc: {
        idAliases: {
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            artClip: (v) => ({ val: Math.round(v * 10) }),
            artGain: (v) => ({ val: Math.round(v * 10) }),
            artFillInput: (v) => ({ val: v, name: 'artFillSource' }),
            artKeyInput: (v) => ({ val: v, name: 'artCutSource' }),
        },
    },
    SSBd: {
        idAliases: {
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            lightSourceAltitude: (v) => ({
                val: Math.round(v),
                name: 'borderLightSourceAltitude',
            }),
            lightSourceDirection: (v) => ({
                val: Math.round(v * 10),
                name: 'borderLightSourceDirection',
            }),
            hue: (v) => ({ val: Math.round(v * 10), name: 'borderHue' }),
            innerWidth: (v) => ({ val: Math.round(v * 100), name: 'borderInnerWidth' }),
            luma: (v) => ({ val: Math.round(v * 10), name: 'borderLuma' }),
            outerWidth: (v) => ({ val: Math.round(v * 100), name: 'borderOuterWidth' }),
            saturation: (v) => ({ val: Math.round(v * 10), name: 'borderSaturation' }),
            enabled: (val) => ({ val, name: 'borderEnabled' }),
            bevel: (val) => ({ val, name: 'borderBevel' }),
            outerSoftness: (val) => ({ val, name: 'borderOuterSoftness' }),
            innerSoftness: (val) => ({ val, name: 'borderInnerSoftness' }),
            bevelPosition: (val) => ({ val, name: 'borderBevelPosition' }),
            bevelSoftness: (val) => ({ val, name: 'borderBevelSoftness' }),
        },
    },
    CSBd: {
        idAliases: {
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            lightSourceAltitude: (v) => ({
                val: Math.round(v),
                name: 'borderLightSourceAltitude',
            }),
            lightSourceDirection: (v) => ({
                val: Math.round(v * 10),
                name: 'borderLightSourceDirection',
            }),
            hue: (v) => ({ val: Math.round(v * 10), name: 'borderHue' }),
            innerWidth: (v) => ({ val: Math.round(v * 100), name: 'borderInnerWidth' }),
            luma: (v) => ({ val: Math.round(v * 10), name: 'borderLuma' }),
            outerWidth: (v) => ({ val: Math.round(v * 100), name: 'borderOuterWidth' }),
            saturation: (v) => ({ val: Math.round(v * 10), name: 'borderSaturation' }),
            enabled: (val) => ({ val, name: 'borderEnabled' }),
            bevel: (val) => ({ val, name: 'borderBevel' }),
            outerSoftness: (val) => ({ val, name: 'borderOuterSoftness' }),
            innerSoftness: (val) => ({ val, name: 'borderInnerSoftness' }),
            bevelPosition: (val) => ({ val, name: 'borderBevelPosition' }),
            bevelSoftness: (val) => ({ val, name: 'borderBevelSoftness' }),
        },
    },
    StRS: {
        idAliases: {},
        propertyAliases: {
            status: (val) => ({ val, name: 'state' }),
        },
    },
    StrR: {
        idAliases: {},
        propertyAliases: {
            isStreaming: (val) => ({ val, name: 'streaming' }),
        },
    },
    SRST: {
        idAliases: {},
        propertyAliases: {
            hour: (val) => ({ val, name: 'hours' }),
            minute: (val) => ({ val, name: 'minutes' }),
            second: (val) => ({ val, name: 'seconds' }),
            frame: (val) => ({ val, name: 'frames' }),
        },
    },
    RTMR: {
        idAliases: {},
        propertyAliases: {
            hour: (val) => ({ val, name: 'hours' }),
            minute: (val) => ({ val, name: 'minutes' }),
            second: (val) => ({ val, name: 'seconds' }),
            frame: (val) => ({ val, name: 'frames' }),
        },
    },
    RcTM: {
        idAliases: {},
        propertyAliases: {
            isRecording: (val) => ({ val, name: 'recording' }),
        },
    },
    RTMS: {
        idAliases: {},
        propertyAliases: {
            status: (val) => ({ val, name: 'state' }),
            totalRecordingTimeAvailable: (val) => ({ val, name: 'recordingTimeAvailable' }),
        },
    },
    FAIP: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            supportedConfigurations: (val) => ({ val: __1.Util.getComponents(val) }),
            supportedInputLevels: (val) => ({ val: __1.Util.getComponents(val) }),
        },
    },
    CMvP: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
        },
        propertyAliases: {},
    },
    MvPr: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
        },
        propertyAliases: {},
    },
    SaMw: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
            windowIndex: 'windowIndex',
        },
        propertyAliases: {},
    },
};
//# sourceMappingURL=converters-8.0.js.map