"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omit = exports.commandStringify = exports.combineComponents = exports.getComponents = exports.padToMultiple4 = exports.BalanceToInt = exports.IntToBalance = exports.DecibelToUInt16BE = exports.UInt16BEToDecibel = exports.convertWAVToRaw = exports.getVideoModeInfo = exports.convertRGBAToYUV422 = exports.bufToNullTerminatedString = exports.bufToBase64String = void 0;
const Enums = require("../enums");
const WaveFile = require("wavefile");
function bufToBase64String(buffer, start, length) {
    return buffer.toString('base64', start, start + length);
}
exports.bufToBase64String = bufToBase64String;
function bufToNullTerminatedString(buffer, start, length) {
    const slice = buffer.slice(start, start + length);
    const nullIndex = slice.indexOf('\0');
    return slice.toString('utf8', 0, nullIndex < 0 ? slice.length : nullIndex);
}
exports.bufToNullTerminatedString = bufToNullTerminatedString;
/**
 * @todo: BALTE - 2018-5-24:
 * Create util functions that handle proper colour spaces in UHD.
 */
function convertRGBAToYUV422(width, height, data) {
    // BT.709 or BT.601
    const KR = height >= 720 ? 0.2126 : 0.299;
    const KB = height >= 720 ? 0.0722 : 0.114;
    const KG = 1 - KR - KB;
    const KRi = 1 - KR;
    const KBi = 1 - KB;
    const YRange = 219;
    const CbCrRange = 224;
    const HalfCbCrRange = CbCrRange / 2;
    const YOffset = 16 << 8;
    const CbCrOffset = 128 << 8;
    const KRoKBi = (KR / KBi) * HalfCbCrRange;
    const KGoKBi = (KG / KBi) * HalfCbCrRange;
    const KBoKRi = (KB / KRi) * HalfCbCrRange;
    const KGoKRi = (KG / KRi) * HalfCbCrRange;
    const genColor = (rawA, uv16, y16) => {
        const a = ((rawA << 2) * 219) / 255 + (16 << 2);
        const y = Math.round(y16) >> 6;
        const uv = Math.round(uv16) >> 6;
        return (a << 20) + (uv << 10) + y;
    };
    const buffer = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height * 4; i += 8) {
        const r1 = data[i + 0];
        const g1 = data[i + 1];
        const b1 = data[i + 2];
        const r2 = data[i + 4];
        const g2 = data[i + 5];
        const b2 = data[i + 6];
        const a1 = data[i + 3];
        const a2 = data[i + 7];
        const y16a = YOffset + KR * YRange * r1 + KG * YRange * g1 + KB * YRange * b1;
        const cb16 = CbCrOffset + (-KRoKBi * r1 - KGoKBi * g1 + HalfCbCrRange * b1);
        const y16b = YOffset + KR * YRange * r2 + KG * YRange * g2 + KB * YRange * b2;
        const cr16 = CbCrOffset + (HalfCbCrRange * r1 - KGoKRi * g1 - KBoKRi * b1);
        buffer.writeUInt32BE(genColor(a1, cb16, y16a), i);
        buffer.writeUInt32BE(genColor(a2, cr16, y16b), i + 4);
    }
    return buffer;
}
exports.convertRGBAToYUV422 = convertRGBAToYUV422;
const dimsPAL = {
    format: Enums.VideoFormat.SD,
    width: 720,
    height: 576,
};
const dimsNTSC = {
    format: Enums.VideoFormat.SD,
    width: 640,
    height: 480,
};
const dims720p = {
    format: Enums.VideoFormat.HD720,
    width: 1280,
    height: 720,
};
const dims1080p = {
    format: Enums.VideoFormat.HD1080,
    width: 1920,
    height: 1080,
};
const dims4k = {
    format: Enums.VideoFormat.UHD4K,
    width: 3840,
    height: 2160,
};
const dims8k = {
    format: Enums.VideoFormat.UDH8K,
    width: 7680,
    height: 4260,
};
const VideoModeInfoImpl = {
    [Enums.VideoMode.N525i5994NTSC]: {
        ...dimsNTSC,
    },
    [Enums.VideoMode.P625i50PAL]: {
        ...dimsPAL,
    },
    [Enums.VideoMode.N525i5994169]: {
        ...dimsNTSC,
    },
    [Enums.VideoMode.P625i50169]: {
        ...dimsPAL,
    },
    [Enums.VideoMode.P720p50]: {
        ...dims720p,
    },
    [Enums.VideoMode.N720p5994]: {
        ...dims720p,
    },
    [Enums.VideoMode.P1080i50]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080i5994]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080p2398]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080p24]: {
        ...dims1080p,
    },
    [Enums.VideoMode.P1080p25]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080p2997]: {
        ...dims1080p,
    },
    [Enums.VideoMode.P1080p50]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080p5994]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N4KHDp2398]: {
        ...dims4k,
    },
    [Enums.VideoMode.N4KHDp24]: {
        ...dims4k,
    },
    [Enums.VideoMode.P4KHDp25]: {
        ...dims4k,
    },
    [Enums.VideoMode.N4KHDp2997]: {
        ...dims4k,
    },
    [Enums.VideoMode.P4KHDp5000]: {
        ...dims4k,
    },
    [Enums.VideoMode.N4KHDp5994]: {
        ...dims4k,
    },
    [Enums.VideoMode.N8KHDp2398]: {
        ...dims8k,
    },
    [Enums.VideoMode.N8KHDp24]: {
        ...dims8k,
    },
    [Enums.VideoMode.P8KHDp25]: {
        ...dims8k,
    },
    [Enums.VideoMode.N8KHDp2997]: {
        ...dims8k,
    },
    [Enums.VideoMode.P8KHDp50]: {
        ...dims8k,
    },
    [Enums.VideoMode.N8KHDp5994]: {
        ...dims8k,
    },
    [Enums.VideoMode.N1080p30]: {
        ...dims1080p,
    },
    [Enums.VideoMode.N1080p60]: {
        ...dims1080p,
    },
};
function getVideoModeInfo(videoMode) {
    return VideoModeInfoImpl[videoMode];
}
exports.getVideoModeInfo = getVideoModeInfo;
function convertWAVToRaw(inputBuffer, model) {
    const wav = new WaveFile(inputBuffer);
    if (wav.fmt.bitsPerSample !== 24) {
        throw new Error(`Invalid wav bit bits per sample: ${wav.fmt.bitsPerSample}`);
    }
    if (wav.fmt.numChannels !== 2) {
        throw new Error(`Invalid number of wav channels: ${wav.fmt.numChannel}`);
    }
    const buffer = Buffer.from(wav.data.samples);
    const buffer2 = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i += 3) {
        // 24bit samples, change endian from wavfile to atem requirements
        buffer2.writeUIntBE(buffer.readUIntLE(i, 3), i, 3);
    }
    if (model === undefined || model >= Enums.Model.PS4K) {
        // If we don't know the model, assume we want the newer mode as that is more likely
        // Newer models want a weird byte order
        const buffer3 = Buffer.alloc(buffer2.length);
        for (let i = 0; i < buffer.length; i += 4) {
            buffer3.writeUIntBE(buffer2.readUIntLE(i, 4), i, 4);
        }
        return buffer3;
    }
    else {
        return buffer2;
    }
}
exports.convertWAVToRaw = convertWAVToRaw;
function UInt16BEToDecibel(input) {
    // 0 = -inf, 32768 = 0, 65381 = +6db
    return Math.round(Math.log10(input / 32768) * 20 * 100) / 100;
}
exports.UInt16BEToDecibel = UInt16BEToDecibel;
function DecibelToUInt16BE(input) {
    return Math.floor(Math.pow(10, input / 20) * 32768);
}
exports.DecibelToUInt16BE = DecibelToUInt16BE;
function IntToBalance(input) {
    // -100000 = -50, 0x0000 = 0, 0x2710 = +50
    return Math.round(input / 200);
}
exports.IntToBalance = IntToBalance;
function BalanceToInt(input) {
    return Math.round(input * 200);
}
exports.BalanceToInt = BalanceToInt;
function padToMultiple4(val) {
    const r = val % 4;
    if (r === 0) {
        return val;
    }
    else {
        return val + (4 - r);
    }
}
exports.padToMultiple4 = padToMultiple4;
function getComponents(val) {
    const res = [];
    for (let next = 1; next <= val; next = next << 1) {
        if ((val & next) > 0) {
            res.push(next);
        }
    }
    return res;
}
exports.getComponents = getComponents;
function combineComponents(vals) {
    let res = 0;
    for (const val of vals) {
        res |= val;
    }
    return res;
}
exports.combineComponents = combineComponents;
function commandStringify(command) {
    return JSON.stringify(command, (_key, value) => (typeof value === 'bigint' ? value.toString() : value));
}
exports.commandStringify = commandStringify;
function omit(o, ...keys) {
    const obj = { ...o };
    for (const key of keys) {
        delete obj[key];
    }
    return obj;
}
exports.omit = omit;
//# sourceMappingURL=atemUtil.js.map