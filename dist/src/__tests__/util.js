"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyState = void 0;
const state_1 = require("../state");
function createEmptyState(cmd) {
    const state = state_1.AtemStateUtil.Create();
    // These should be the maximum supported by any device.
    // But they can also be whatever is needed to allow the tests to run without error
    state.info.capabilities = {
        mixEffects: 4,
        sources: 40,
        auxilliaries: 6,
        mixMinusOutputs: 8,
        mediaPlayers: 4,
        serialPorts: 1,
        maxHyperdecks: 4,
        DVEs: 1,
        stingers: 1,
        superSources: 2,
        talkbackChannels: 2,
        downstreamKeyers: 4,
        cameraControl: true,
        advancedChromaKeyers: true,
        onlyConfigurableOutputs: true,
    };
    state.info.mixEffects = [
        {
            keyCount: 4,
        },
        {
            keyCount: 4,
        },
        {
            keyCount: 4,
        },
        {
            keyCount: 4,
        },
    ];
    state.info.multiviewer = {
        count: 255,
        windowCount: 16,
    };
    state.streaming = {
        service: {
            serviceName: '',
            url: '',
            key: '',
            bitrates: [0, 0],
        },
    };
    state.recording = {
        properties: {
            filename: '',
            workingSet1DiskId: 0,
            workingSet2DiskId: 0,
            recordInAllCameras: false,
        },
        disks: {},
    };
    state.audio = {
        channels: {},
    };
    state.fairlight = {
        inputs: {},
        master: {
            equalizer: {
                enabled: false,
                gain: 0,
                bands: [undefined, undefined, undefined, undefined, undefined],
            },
        },
    };
    if (cmd) {
        // Some commands need some very specific bits of state defined that are hard to do in a generic way
        // This is where we do some light (and hopefully generic) inspection of commands and make sure the state bits they need are defined
        const cmdAny = cmd;
        if (cmdAny.constructor.name.includes('Fairlight') && 'index' in cmdAny && typeof cmdAny.index === 'number') {
            const input = {
                sources: {},
            };
            state.fairlight.inputs[cmdAny.index] = input;
            if ('source' in cmdAny && typeof cmdAny.source === 'bigint') {
                input.sources[cmdAny.source.toString()] = {
                    equalizer: {
                        enabled: false,
                        gain: 0,
                        bands: [undefined, undefined, undefined, undefined, undefined],
                    },
                };
            }
        }
    }
    if (state.info.multiviewer) {
        for (let i = 0; i < state.info.multiviewer.count; i++) {
            const windows = [];
            for (let o = 0; o < state.info.multiviewer.windowCount; o++) {
                windows.push({ windowIndex: o, source: 0, supportsSafeArea: true, supportsVuMeter: true });
            }
            state.settings.multiViewers[i] = {
                index: i,
                windows: windows,
            };
        }
    }
    return state;
}
exports.createEmptyState = createEmptyState;
//# sourceMappingURL=util.js.map