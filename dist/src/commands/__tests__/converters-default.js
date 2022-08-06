"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConverters = void 0;
const __1 = require("../..");
exports.DefaultCommandConverters = {
    _ver: {
        idAliases: {},
        propertyAliases: {
            protocolVersion: (v) => ({ val: v, name: 'version' }),
        },
    },
    _pin: {
        idAliases: {},
        propertyAliases: {
            name: (val) => ({ val, name: 'productIdentifier' }),
        },
    },
    _SSC: {
        idAliases: {
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            boxes: (val) => ({ val, name: 'boxCount' }),
        },
        customMutate: (val) => {
            if (!('sSrcId' in val)) {
                val.sSrcId = 0;
            }
            return val;
        },
    },
    InPr: {
        idAliases: {},
        propertyAliases: {
            id: (val) => ({ val, name: 'inputId' }),
        },
        customMutate: (props) => {
            props.externalPorts = __1.Util.getComponents(props.availableExternalPorts);
            delete props.availableExternalPorts;
            return props;
        },
    },
    SSBP: {
        idAliases: {
            boxId: 'boxIndex',
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            cropBottom: (v) => ({ val: Math.round(v * 1000) }),
            cropTop: (v) => ({ val: Math.round(v * 1000) }),
            cropLeft: (v) => ({ val: Math.round(v * 1000) }),
            cropRight: (v) => ({ val: Math.round(v * 1000) }),
            size: (v) => ({ val: Math.round(v * 1000) }),
            positionX: (v) => ({ val: Math.round(v * 100), name: 'x' }),
            positionY: (v) => ({ val: Math.round(v * 100), name: 'y' }),
            inputSource: (v) => ({ val: v, name: 'source' }),
        },
        customMutate: (val) => {
            if (!('sSrcId' in val)) {
                val.sSrcId = 0;
            }
            return val;
        },
    },
    CSBP: {
        idAliases: {
            boxId: 'boxIndex',
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            cropBottom: (v) => ({ val: Math.round(v * 1000) }),
            cropTop: (v) => ({ val: Math.round(v * 1000) }),
            cropLeft: (v) => ({ val: Math.round(v * 1000) }),
            cropRight: (v) => ({ val: Math.round(v * 1000) }),
            size: (v) => ({ val: Math.round(v * 1000) }),
            positionX: (v) => ({ val: Math.round(v * 100), name: 'x' }),
            positionY: (v) => ({ val: Math.round(v * 100), name: 'y' }),
            inputSource: (v) => ({ val: v, name: 'source' }),
        },
    },
    SSrc: {
        idAliases: {},
        propertyAliases: {
            artClip: (v) => ({ val: Math.round(v * 10) }),
            artGain: (v) => ({ val: Math.round(v * 10) }),
            borderLightSourceAltitude: (v) => ({ val: Math.round(v) }),
            borderLightSourceDirection: (v) => ({ val: Math.round(v * 10) }),
            borderHue: (v) => ({ val: Math.round(v * 10) }),
            borderInnerWidth: (v) => ({ val: Math.round(v * 100) }),
            borderLuma: (v) => ({ val: Math.round(v * 10) }),
            borderOuterWidth: (v) => ({ val: Math.round(v * 100) }),
            borderSaturation: (v) => ({ val: Math.round(v * 10) }),
            borderInnerSoftness: (v) => ({ val: v }),
            borderOuterSoftness: (v) => ({ val: v }),
            artFillInput: (v) => ({ val: v, name: 'artFillSource' }),
            artKeyInput: (v) => ({ val: v, name: 'artCutSource' }),
        },
        customMutate: (o) => {
            return {
                properties: {
                    artFillSource: o.artFillSource,
                    artCutSource: o.artCutSource,
                    artOption: o.artOption,
                    artPreMultiplied: o.artPreMultiplied,
                    artClip: o.artClip,
                    artGain: o.artGain,
                    artInvertKey: o.artInvertKey,
                },
                border: {
                    borderEnabled: o.borderEnabled,
                    borderBevel: o.borderBevel,
                    borderOuterWidth: o.borderOuterWidth,
                    borderInnerWidth: o.borderInnerWidth,
                    borderOuterSoftness: o.borderOuterSoftness,
                    borderInnerSoftness: o.borderInnerSoftness,
                    borderBevelSoftness: o.borderBevelSoftness,
                    borderBevelPosition: o.borderBevelPosition,
                    borderHue: o.borderHue,
                    borderSaturation: o.borderSaturation,
                    borderLuma: o.borderLuma,
                    borderLightSourceDirection: o.borderLightSourceDirection,
                    borderLightSourceAltitude: o.borderLightSourceAltitude,
                },
            };
        },
    },
    CSSc: {
        idAliases: {
            ssrcId: 'sSrcId',
        },
        propertyAliases: {
            artClip: (v) => ({ val: Math.round(v * 10) }),
            artGain: (v) => ({ val: Math.round(v * 10) }),
            borderLightSourceAltitude: (v) => ({ val: Math.round(v) }),
            borderLightSourceDirection: (v) => ({ val: Math.round(v * 10) }),
            borderHue: (v) => ({ val: Math.round(v * 10) }),
            borderInnerWidth: (v) => ({ val: Math.round(v * 100) }),
            borderLuma: (v) => ({ val: Math.round(v * 10) }),
            borderOuterWidth: (v) => ({ val: Math.round(v * 100) }),
            borderSaturation: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    DskP: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {
            clip: (v) => ({ val: Math.round(v * 10) }),
            gain: (v) => ({ val: Math.round(v * 10) }),
            preMultipliedKey: (v) => ({ val: v, name: 'preMultiply' }),
            maskLeft: (v) => ({ val: Math.round(v * 1000) }),
            maskRight: (v) => ({ val: Math.round(v * 1000) }),
            maskTop: (v) => ({ val: Math.round(v * 1000) }),
            maskBottom: (v) => ({ val: Math.round(v * 1000) }),
        },
        customMutate: (obj) => {
            obj['mask'] = {
                enabled: obj['maskEnabled'],
                top: obj['maskTop'],
                bottom: obj['maskBottom'],
                left: obj['maskLeft'],
                right: obj['maskRight'],
            };
            delete obj['maskEnabled'];
            delete obj['maskTop'];
            delete obj['maskBottom'];
            delete obj['maskLeft'];
            delete obj['maskRight'];
            return obj;
        },
    },
    CDsG: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {
            clip: (v) => ({ val: Math.round(v * 10) }),
            gain: (v) => ({ val: Math.round(v * 10) }),
            preMultipliedKey: (v) => ({ val: v, name: 'preMultiply' }),
        },
    },
    DskS: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    DskB: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    DDsA: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    CDsT: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    CDsR: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    CDsL: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {},
    },
    CDsC: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {
            cutSource: (v) => ({ val: v, name: 'input' }),
        },
    },
    CDsF: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {
            fillSource: (v) => ({ val: v, name: 'input' }),
        },
    },
    CDsM: {
        idAliases: {
            downstreamKeyerId: 'index',
        },
        propertyAliases: {
            maskEnabled: (val) => ({ val, name: 'enabled' }),
            maskLeft: (v) => ({ val: Math.round(v * 1000), name: 'left' }),
            maskRight: (v) => ({ val: Math.round(v * 1000), name: 'right' }),
            maskTop: (v) => ({ val: Math.round(v * 1000), name: 'top' }),
            maskBottom: (v) => ({ val: Math.round(v * 1000), name: 'bottom' }),
        },
    },
    AMIP: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            balance: (v) => ({ val: Math.round(v) }),
            gain: (v) => ({ val: Math.round(v * 100) / 100 }),
        },
        customMutate: (props) => {
            delete props.indexOfSourceType;
            return props;
        },
        processDeserialized: (props) => {
            props.gain = Math.round(props.gain * 100) / 100;
        },
    },
    CAMI: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            balance: (v) => ({ val: Math.round(v * 200) / 200 }),
            // 'gain': (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 })
        },
    },
    AMMO: {
        idAliases: {},
        propertyAliases: {
            programOutFollowFadeToBlack: (val) => ({ val, name: 'followFadeToBlack' }),
            balance: (v) => ({ val: Math.round(v) }),
            gain: (v) => ({ val: Math.round(v * 100) / 100 }),
        },
    },
    CAMm: {
        idAliases: {},
        propertyAliases: {
            dimLevel: (v) => ({ val: Math.round(v * 100) }),
            // gain: (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 })
        },
    },
    AMmO: {
        idAliases: {},
        propertyAliases: {
            dimLevel: (v) => ({ val: Math.round(v * 100) }),
            gain: (v) => ({ val: Math.round(v * 100) / 100 }),
        },
    },
    CAMH: {
        idAliases: {},
        propertyAliases: {
        // gain: (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 }),
        // programOutGain: (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 }),
        // talkbackGain: (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 }),
        // sidetoneGain: (v: number): PropertyAliasResult => ({ val: Math.round(v * 100) / 100 })
        },
    },
    AMHP: {
        idAliases: {},
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 100) / 100 }),
            programOutGain: (v) => ({ val: Math.round(v * 100) / 100 }),
            talkbackGain: (v) => ({ val: Math.round(v * 100) / 100 }),
            sidetoneGain: (v) => ({ val: Math.round(v * 100) / 100 }),
        },
    },
    _top: {
        idAliases: {},
        propertyAliases: {
            auxiliaries: (val) => ({ val, name: 'auxilliaries' }),
            dVE: (val) => ({ val, name: 'DVEs' }),
            hyperDecks: (val) => ({ val, name: 'maxHyperdecks' }),
            mixEffectBlocks: (val) => ({ val, name: 'mixEffects' }),
            serialPort: (val) => ({ val, name: 'serialPorts' }),
            videoSources: (val) => ({ val, name: 'sources' }),
            superSource: (val) => ({ val, name: 'superSources' }),
        },
        customMutate: (props) => {
            if (props.multiviewers === undefined) {
                props.multiviewers = -1;
            }
            if (props.talkbackChannels === undefined) {
                props.talkbackChannels = 0;
            }
            props.onlyConfigurableOutputs = props.onlyConfigurableOutputs || false;
            props.advancedChromaKeyers = props.advancedChromaKeyers || false;
            props.cameraControl = props.cameraControl || false;
            return props;
        },
    },
    _MeC: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            balance: (v) => ({ val: Math.round(v * 200) / 200 }),
        },
    },
    FTCD: {
        idAliases: {},
        propertyAliases: {},
        customMutate: (obj) => {
            delete obj['unknown'];
            delete obj['test3'];
            return obj;
        },
    },
    FTFD: {
        idAliases: {},
        propertyAliases: {
            filename: (val) => ({ val, name: 'fileName' }),
        },
    },
    Powr: {
        idAliases: {},
        propertyAliases: {},
        customMutate: (obj) => {
            return [obj.pin1, obj.pin2];
        },
    },
    KePt: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            pattern: (val) => ({ val, name: 'style' }),
            inverse: (val) => ({ val, name: 'invert' }),
            size: (v) => ({ val: Math.round(v * 100) }),
            softness: (v) => ({ val: Math.round(v * 100) }),
            symmetry: (v) => ({ val: Math.round(v * 100) }),
            xPosition: (v) => ({ val: Math.round(v * 10000), name: 'positionX' }),
            yPosition: (v) => ({ val: Math.round(v * 10000), name: 'positionY' }),
        },
    },
    CKPt: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            pattern: (val) => ({ val, name: 'style' }),
            inverse: (val) => ({ val, name: 'invert' }),
            size: (v) => ({ val: Math.round(v * 100) }),
            softness: (v) => ({ val: Math.round(v * 100) }),
            symmetry: (v) => ({ val: Math.round(v * 100) }),
            xPosition: (v) => ({ val: Math.round(v * 10000), name: 'positionX' }),
            yPosition: (v) => ({ val: Math.round(v * 10000), name: 'positionY' }),
        },
    },
    KeCk: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            hue: (v) => ({ val: Math.round(v * 10) }),
            lift: (v) => ({ val: Math.round(v * 10) }),
            ySuppress: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    CKCk: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            hue: (v) => ({ val: Math.round(v * 10) }),
            lift: (v) => ({ val: Math.round(v * 10) }),
            ySuppress: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    CKTp: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            keyType: (v) => ({ val: v, name: 'mixEffectKeyType' }),
        },
    },
    KeOn: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    CKOn: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    CKeF: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    KeLm: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    CKLm: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    KeBP: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            // 'upstreamKeyerId': 'keyerIndex'
        },
        propertyAliases: {
            keyerIndex: (val) => ({ val, name: 'upstreamKeyerId' }),
            keyType: (val) => ({ val, name: 'mixEffectKeyType' }),
            maskSettings: (v) => ({
                val: {
                    maskLeft: Math.round(v.maskLeft * 1000),
                    maskRight: Math.round(v.maskRight * 1000),
                    maskTop: Math.round(v.maskTop * 1000),
                    maskBottom: Math.round(v.maskBottom * 1000),
                },
            }),
            maskEnabled: (v) => ({ val: v, name: 'maskSettings.maskEnabled' }),
            maskLeft: (v) => ({
                val: Math.round(v * 1000),
                name: 'maskSettings.maskLeft',
            }),
            maskRight: (v) => ({
                val: Math.round(v * 1000),
                name: 'maskSettings.maskRight',
            }),
            maskTop: (v) => ({ val: Math.round(v * 1000), name: 'maskSettings.maskTop' }),
            maskBottom: (v) => ({
                val: Math.round(v * 1000),
                name: 'maskSettings.maskBottom',
            }),
        },
    },
    KeFS: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    RFlK: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            keyFrame: (v) => ({ val: v, name: 'keyFrameId' }),
            runToInfinite: (v) => ({ val: v, name: 'direction' }),
        },
    },
    KeDV: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            positionX: (v) => ({ val: Math.round(v * 1000) }),
            positionY: (v) => ({ val: Math.round(v * 1000) }),
            sizeX: (v) => ({ val: Math.round(v * 1000) }),
            sizeY: (v) => ({ val: Math.round(v * 1000) }),
            rotation: (v) => ({ val: Math.round(v * 10) }),
            borderHue: (v) => ({ val: Math.round(v * 10) }),
            borderInnerWidth: (v) => ({ val: Math.round(v * 100) }),
            borderLuma: (v) => ({ val: Math.round(v * 10) }),
            borderOuterWidth: (v) => ({ val: Math.round(v * 100) }),
            borderSaturation: (v) => ({ val: Math.round(v * 10) }),
            lightSourceDirection: (v) => ({ val: Math.round(v * 10) }),
            borderShadowEnabled: (val) => ({ val, name: 'shadowEnabled' }),
            maskLeft: (v) => ({ val: Math.round(v * 1000) }),
            maskRight: (v) => ({ val: Math.round(v * 1000) }),
            maskTop: (v) => ({ val: Math.round(v * 1000) }),
            maskBottom: (v) => ({ val: Math.round(v * 1000) }),
        },
    },
    CKDV: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            positionX: (v) => ({ val: Math.round(v * 1000) }),
            positionY: (v) => ({ val: Math.round(v * 1000) }),
            sizeX: (v) => ({ val: Math.round(v * 1000) }),
            sizeY: (v) => ({ val: Math.round(v * 1000) }),
            rotation: (v) => ({ val: Math.round(v * 10) }),
            borderHue: (v) => ({ val: Math.round(v * 10) }),
            borderInnerWidth: (v) => ({ val: Math.round(v * 100) }),
            borderLuma: (v) => ({ val: Math.round(v * 10) }),
            borderOuterWidth: (v) => ({ val: Math.round(v * 100) }),
            borderSaturation: (v) => ({ val: Math.round(v * 10) }),
            lightSourceDirection: (v) => ({ val: Math.round(v * 10) }),
            borderShadowEnabled: (val) => ({ val, name: 'shadowEnabled' }),
            maskLeft: (v) => ({ val: Math.round(v * 1000) }),
            maskRight: (v) => ({ val: Math.round(v * 1000) }),
            maskTop: (v) => ({ val: Math.round(v * 1000) }),
            maskBottom: (v) => ({ val: Math.round(v * 1000) }),
        },
    },
    CKeC: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    CKMs: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            maskLeft: (v) => ({ val: Math.round(v * 1000) }),
            maskRight: (v) => ({ val: Math.round(v * 1000) }),
            maskTop: (v) => ({ val: Math.round(v * 1000) }),
            maskBottom: (v) => ({ val: Math.round(v * 1000) }),
        },
    },
    TDvP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    CTDv: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    TStP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    CTSt: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 10) }),
            clip: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    TrPr: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            previewTransition: (val) => ({ val, name: 'preview' }),
        },
    },
    CTPr: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            previewTransition: (val) => ({ val, name: 'preview' }),
        },
    },
    TrSS: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            selection: (val) => ({ val: __1.Util.getComponents(val) }),
            nextSelection: (val) => ({ val: __1.Util.getComponents(val) }),
        },
    },
    CTTp: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            nextSelection: (val) => ({ val: __1.Util.getComponents(val) }),
        },
    },
    TMxP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    CTMx: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    TDpP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    CTDp: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    TWpP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            symmetry: (v) => ({ val: Math.round(v * 100) }),
            xPosition: (v) => ({ val: Math.round(v * 10000) }),
            yPosition: (v) => ({ val: Math.round(v * 10000) }),
            borderSoftness: (v) => ({ val: Math.round(v * 100) }),
            borderWidth: (v) => ({ val: Math.round(v * 100) }),
        },
    },
    CTWp: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            symmetry: (v) => ({ val: Math.round(v * 100) }),
            xPosition: (v) => ({ val: Math.round(v * 10000) }),
            yPosition: (v) => ({ val: Math.round(v * 10000) }),
            borderSoftness: (v) => ({ val: Math.round(v * 100) }),
            borderWidth: (v) => ({ val: Math.round(v * 100) }),
        },
    },
    TrPs: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            handlePosition: (v) => ({ val: Math.round(v * 10000) }),
        },
    },
    CTPs: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {
            handlePosition: (v) => ({ val: Math.round(v * 10000) }),
        },
    },
    MRPr: {
        idAliases: {},
        propertyAliases: {
            index: (val) => ({ val, name: 'macroIndex' }),
        },
    },
    MRcS: {
        idAliases: {},
        propertyAliases: {
            index: (val) => ({ val, name: 'macroIndex' }),
        },
    },
    MSRc: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {},
    },
    CMPr: {
        idAliases: {
            macroIndex: 'index',
        },
        propertyAliases: {},
    },
    MvIn: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
        },
        propertyAliases: {
            supportVuMeter: (val) => ({ val, name: 'supportsVuMeter' }),
        },
    },
    CMvI: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
        },
        propertyAliases: {},
    },
    VidM: {
        idAliases: {},
        propertyAliases: {
            videoMode: (val) => ({ val, name: 'mode' }),
        },
    },
    CVdM: {
        idAliases: {},
        propertyAliases: {
            videoMode: (val) => ({ val, name: 'mode' }),
        },
    },
    RCPS: {
        idAliases: {
            mediaPlayerId: 'index',
        },
        propertyAliases: {},
    },
    SCPS: {
        idAliases: {
            mediaPlayerId: 'index',
        },
        propertyAliases: {},
    },
    MPCS: {
        idAliases: {
            clipId: 'index',
        },
        propertyAliases: {},
    },
    SMPC: {
        idAliases: {
        // 'mediaPool': 'index'
        },
        propertyAliases: {},
    },
    MPfe: {
        idAliases: {
            mediaPool: 'bank',
            frameIndex: 'index',
        },
        propertyAliases: {
            filename: (val) => ({ val, name: 'fileName' }),
        },
    },
    MPrp: {
        idAliases: {
            macroIndex: 'index',
        },
        propertyAliases: {
        // index: (val: any): PropertyAliasResult => ({ val, name: 'macroIndex' })
        },
    },
    PrgI: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    CPgI: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    PrvI: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    CPvI: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    DCut: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    DAut: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    FtbS: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    FtbC: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    FtbA: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    FtbP: {
        idAliases: {
            mixEffect: 'index',
        },
        propertyAliases: {},
    },
    AuxS: {
        idAliases: {
            auxBus: 'id',
        },
        propertyAliases: {},
    },
    CAuS: {
        idAliases: {
            auxBus: 'id',
        },
        propertyAliases: {},
    },
    CInL: {
        idAliases: {
            inputId: 'id',
        },
        propertyAliases: {},
    },
    MAct: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {},
    },
    FTDa: {
        idAliases: {},
        propertyAliases: {
            body: (v) => ({ val: Buffer.from(v, 'base64') }),
        },
        customMutate: (obj) => {
            obj.size = obj.body.length;
            return obj;
        },
    },
    KKFP: {
        idAliases: {
            upstreamKeyerId: 'keyerIndex',
            mixEffect: 'mixEffectIndex',
            keyFrameId: 'keyFrame',
        },
        propertyAliases: {
            bevelPosition: (val) => ({ val, name: 'borderBevelPosition' }),
            bevelSoftness: (val) => ({ val, name: 'borderBevelSoftness' }),
            innerSoftness: (val) => ({ val, name: 'borderInnerSoftness' }),
            innerWidth: (val) => ({ val: Math.round(val * 100), name: 'borderInnerWidth' }),
            outerSoftness: (val) => ({ val, name: 'borderOuterSoftness' }),
            outerWidth: (val) => ({ val: Math.round(val * 100), name: 'borderOuterWidth' }),
            positionX: (val) => ({ val: Math.round(val * 1000) }),
            sizeX: (val) => ({ val: Math.round(val * 1000) }),
            positionY: (val) => ({ val: Math.round(val * 1000) }),
            sizeY: (val) => ({ val: Math.round(val * 1000) }),
            rotation: (val) => ({ val: Math.round(val * 10) }),
            borderHue: (val) => ({ val: Math.round(val * 10) }),
            borderLuma: (val) => ({ val: Math.round(val * 10) }),
            borderSaturation: (val) => ({ val: Math.round(val * 10) }),
            lightSourceDirection: (val) => ({ val: Math.round(val * 10) }),
            maskBottom: (val) => ({ val: Math.round(val * 1000) }),
            maskTop: (val) => ({ val: Math.round(val * 1000) }),
            maskLeft: (val) => ({ val: Math.round(val * 1000) }),
            maskRight: (val) => ({ val: Math.round(val * 1000) }),
        },
        customMutate: (obj) => {
            delete obj.maskEnabled;
            return obj;
        },
    },
    CKFP: {
        idAliases: {
            upstreamKeyerId: 'keyerIndex',
            mixEffect: 'mixEffectIndex',
            keyFrameId: 'keyFrame',
        },
        propertyAliases: {
            bevelPosition: (val) => ({ val, name: 'borderBevelPosition' }),
            bevelSoftness: (val) => ({ val, name: 'borderBevelSoftness' }),
            innerSoftness: (val) => ({ val, name: 'borderInnerSoftness' }),
            innerWidth: (val) => ({ val: Math.round(val * 100), name: 'borderInnerWidth' }),
            outerSoftness: (val) => ({ val, name: 'borderOuterSoftness' }),
            outerWidth: (val) => ({ val: Math.round(val * 100), name: 'borderOuterWidth' }),
            positionX: (val) => ({ val: Math.round(val * 1000) }),
            sizeX: (val) => ({ val: Math.round(val * 1000) }),
            positionY: (val) => ({ val: Math.round(val * 1000) }),
            sizeY: (val) => ({ val: Math.round(val * 1000) }),
            rotation: (val) => ({ val: Math.round(val * 10) }),
            borderHue: (val) => ({ val: Math.round(val * 10) }),
            borderLuma: (val) => ({ val: Math.round(val * 10) }),
            borderSaturation: (val) => ({ val: Math.round(val * 10) }),
            lightSourceDirection: (val) => ({ val: Math.round(val * 10) }),
            maskBottom: (val) => ({ val: Math.round(val * 1000) }),
            maskTop: (val) => ({ val: Math.round(val * 1000) }),
            maskLeft: (val) => ({ val: Math.round(val * 1000) }),
            maskRight: (val) => ({ val: Math.round(val * 1000) }),
        },
    },
    SFKF: {
        idAliases: {
            upstreamKeyerId: 'keyerIndex',
            mixEffect: 'mixEffectIndex',
            keyFrameId: 'keyFrame',
        },
        propertyAliases: {},
    },
    MPCE: {
        idAliases: {
            mediaPlayerId: 'index',
        },
        propertyAliases: {},
        customMutate: (obj) => {
            obj.clipIndex = 0;
            obj.stillIndex = 0;
            if (obj.sourceType === 1) {
                obj.stillIndex = obj.sourceIndex;
            }
            else {
                obj.clipIndex = obj.sourceIndex;
            }
            delete obj.sourceIndex;
            return obj;
        },
    },
    MPSS: {
        idAliases: {
            mediaPlayerId: 'index',
        },
        propertyAliases: {},
    },
    Time: {
        idAliases: {},
        propertyAliases: {
            isDropFrame: (val) => ({ val, name: 'dropFrame' }),
        },
    },
    FAIP: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            supportedConfigurations: (val) => ({ val: __1.Util.getComponents(val) }),
        },
        customMutate: (props) => {
            props.activeInputLevel = props.rcaToXlrEnabled
                ? __1.Enums.FairlightAnalogInputLevel.ProLine
                : __1.Enums.FairlightAnalogInputLevel.Microphone;
            delete props.rcaToXlrEnabled;
            props.supportedInputLevels = props.supportsRcaToXlr
                ? [__1.Enums.FairlightAnalogInputLevel.ProLine, __1.Enums.FairlightAnalogInputLevel.Microphone]
                : [];
            delete props.supportsRcaToXlr;
            return props;
        },
    },
    CFIP: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {},
    },
    FASD: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
        },
    },
    FASP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            balance: (val) => ({ val: Math.round(val * 100) }),
            gain: (val) => ({ val: Math.round(val * 100) }),
            equalizerGain: (val) => ({ val: Math.round(val * 100) }),
            faderGain: (val) => ({ val: Math.round(val * 100) }),
            makeUpGain: (val) => ({ val: Math.round(val * 100) }),
            stereoSimulation: (val) => ({ val: Math.round(val * 100) }),
            supportedMixOptions: (val) => ({ val: __1.Util.getComponents(val) }),
            equalizerBands: (val) => ({ val, name: 'bandCount' }),
        },
    },
    CFSP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            balance: (val) => ({ val: Math.round(val * 100) }),
            gain: (val) => ({ val: Math.round(val * 100) }),
            equalizerGain: (val) => ({ val: Math.round(val * 100) }),
            faderGain: (val) => ({ val: Math.round(val * 100) }),
            makeUpGain: (val) => ({ val: Math.round(val * 100) }),
            stereoSimulation: (val) => ({ val: Math.round(val * 100) }),
            supportedMixOptions: (val) => ({ val: __1.Util.getComponents(val) }),
        },
    },
    FAMP: {
        idAliases: {},
        propertyAliases: {
            equalizerGain: (val) => ({ val: Math.round(val * 100) }),
            gain: (val) => ({ val: Math.round(val * 100), name: 'faderGain' }),
            makeUpGain: (val) => ({ val: Math.round(val * 100) }),
            equalizerBands: (val) => ({ val, name: 'bandCount' }),
        },
    },
    CFMP: {
        idAliases: {},
        propertyAliases: {
            equalizerGain: (val) => ({ val: Math.round(val * 100) }),
            gain: (val) => ({ val: Math.round(val * 100), name: 'faderGain' }),
            makeUpGain: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    FMPP: {
        idAliases: {},
        propertyAliases: {
            audioFollowVideoCrossfadeTransitionEnabled: (val) => ({
                val,
                name: 'audioFollowVideo',
            }),
        },
    },
    CMPP: {
        idAliases: {},
        propertyAliases: {
            audioFollowVideoCrossfadeTransitionEnabled: (val) => ({
                val,
                name: 'audioFollowVideo',
            }),
        },
    },
    FMHP: {
        idAliases: {},
        propertyAliases: {
            gain: (val) => ({ val: Math.round(val * 100) }),
            inputMasterGain: (val) => ({ val: Math.round(val * 100) }),
            inputSidetoneGain: (val) => ({ val: Math.round(val * 100) }),
            inputTalkbackGain: (val) => ({ val: Math.round(val * 100) }),
            inputMasterEnabled: (val) => ({ val: !val, name: 'inputMasterMuted' }),
        },
    },
    CFMH: {
        idAliases: {},
        propertyAliases: {
            gain: (val) => ({ val: Math.round(val * 100) }),
            inputMasterGain: (val) => ({ val: Math.round(val * 100) }),
            inputSidetoneGain: (val) => ({ val: Math.round(val * 100) }),
            inputTalkbackGain: (val) => ({ val: Math.round(val * 100) }),
            inputMasterEnabled: (val) => ({ val: !val, name: 'inputMasterMuted' }),
        },
    },
    MOCP: {
        idAliases: {},
        propertyAliases: {
            threshold: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    CMCP: {
        idAliases: {},
        propertyAliases: {
            threshold: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    AICP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    CICP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    AMLP: {
        idAliases: {},
        propertyAliases: {
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    CMLP: {
        idAliases: {},
        propertyAliases: {
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    AILP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    CILP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    AIXP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            range: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    CIXP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            threshold: (val) => ({ val: Math.round(val * 100) }),
            attack: (val) => ({ val: Math.round(val * 100) }),
            hold: (val) => ({ val: Math.round(val * 100) }),
            release: (val) => ({ val: Math.round(val * 100) }),
            ratio: (val) => ({ val: Math.round(val * 100) }),
            range: (val) => ({ val: Math.round(val * 100) }),
        },
    },
    RICD: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
        },
    },
    RICE: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
        },
    },
    RFIP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
        },
    },
    AEBP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
            band: 'band',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            gain: (v) => ({ val: Math.round(v * 100) }),
            qFactor: (v) => ({ val: Math.round(v * 100) }),
            supportedFrequencyRanges: (v) => ({ val: __1.Util.getComponents(v) }),
            supportedShapes: (v) => ({ val: __1.Util.getComponents(v) }),
        },
    },
    CEBP: {
        idAliases: {
            index: 'index',
            source: 'sourceId',
            band: 'band',
        },
        propertyAliases: {
            sourceId: (val) => ({ val: BigInt(val), name: 'sourceId' }),
            gain: (v) => ({ val: Math.round(v * 100) }),
            qFactor: (v) => ({ val: Math.round(v * 100) }),
        },
    },
    ColV: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            hue: (val) => ({ val: Math.round(val * 10) }),
            saturation: (val) => ({ val: Math.round(val * 10) }),
            luma: (val) => ({ val: Math.round(val * 10) }),
        },
    },
    CClV: {
        idAliases: {
            index: 'index',
        },
        propertyAliases: {
            hue: (val) => ({ val: Math.round(val * 10) }),
            saturation: (val) => ({ val: Math.round(val * 10) }),
            luma: (val) => ({ val: Math.round(val * 10) }),
        },
    },
    VuMo: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
        },
        propertyAliases: {
            opacity: (val) => ({ val: Math.round(val) }),
        },
    },
    VuMS: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
            windowIndex: 'windowIndex',
        },
        propertyAliases: {},
    },
    VuMC: {
        idAliases: {
            multiViewerId: 'multiviewIndex',
            windowIndex: 'windowIndex',
        },
        propertyAliases: {},
    },
    RACK: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {},
    },
    CACK: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            backgroundLevel: (v) => ({ val: Math.round(v * 10) }),
            foregroundLevel: (v) => ({ val: Math.round(v * 10) }),
            keyEdge: (v) => ({ val: Math.round(v * 10) }),
            spillSuppression: (v) => ({ val: Math.round(v * 10) }),
            flareSuppression: (v) => ({ val: Math.round(v * 10) }),
            brightness: (v) => ({ val: Math.round(v * 10) }),
            contrast: (v) => ({ val: Math.round(v * 10) }),
            saturation: (v) => ({ val: Math.round(v * 10) }),
            red: (v) => ({ val: Math.round(v * 10) }),
            green: (v) => ({ val: Math.round(v * 10) }),
            blue: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    KACk: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            backgroundLevel: (v) => ({ val: Math.round(v * 10) }),
            foregroundLevel: (v) => ({ val: Math.round(v * 10) }),
            keyEdge: (v) => ({ val: Math.round(v * 10) }),
            spillSuppression: (v) => ({ val: Math.round(v * 10) }),
            flareSuppression: (v) => ({ val: Math.round(v * 10) }),
            brightness: (v) => ({ val: Math.round(v * 10) }),
            contrast: (v) => ({ val: Math.round(v * 10) }),
            saturation: (v) => ({ val: Math.round(v * 10) }),
            red: (v) => ({ val: Math.round(v * 10) }),
            green: (v) => ({ val: Math.round(v * 10) }),
            blue: (v) => ({ val: Math.round(v * 10) }),
        },
    },
    KACC: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            sampledY: (v) => ({ val: Math.round(v * 10000) }),
            sampledCb: (v) => ({ val: Math.round(v * 10000) }),
            sampledCr: (v) => ({ val: Math.round(v * 10000) }),
            cursorSize: (v) => ({ val: Math.round(v * 100) }),
            cursorX: (v) => ({ val: Math.round(v * 1000) }),
            cursorY: (v) => ({ val: Math.round(v * 1000) }),
        },
    },
    CACC: {
        idAliases: {
            mixEffect: 'mixEffectIndex',
            upstreamKeyerId: 'keyerIndex',
        },
        propertyAliases: {
            sampledY: (v) => ({ val: Math.round(v * 10000) }),
            sampledCb: (v) => ({ val: Math.round(v * 10000) }),
            sampledCr: (v) => ({ val: Math.round(v * 10000) }),
            cursorSize: (v) => ({ val: Math.round(v * 100) }),
            cursorX: (v) => ({ val: Math.round(v * 1000) }),
            cursorY: (v) => ({ val: Math.round(v * 1000) }),
        },
    },
    AMBP: {
        idAliases: {
            band: 'band',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 100) }),
            qFactor: (v) => ({ val: Math.round(v * 100) }),
            supportedFrequencyRanges: (v) => ({ val: __1.Util.getComponents(v) }),
            supportedShapes: (v) => ({ val: __1.Util.getComponents(v) }),
        },
    },
    CMBP: {
        idAliases: {
            band: 'band',
        },
        propertyAliases: {
            gain: (v) => ({ val: Math.round(v * 100) }),
            qFactor: (v) => ({ val: Math.round(v * 100) }),
        },
    },
};
//# sourceMappingURL=converters-default.js.map