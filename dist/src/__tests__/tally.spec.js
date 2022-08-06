"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tally_1 = require("../lib/tally");
const fs_1 = require("fs");
const path_1 = require("path");
const state_1 = require("../state");
const util_1 = require("./util");
const atemUtil_1 = require("../lib/atemUtil");
function readJson(fileName) {
    const filePath = (0, path_1.resolve)(__dirname, fileName);
    const fileData = (0, fs_1.readFileSync)(filePath);
    return JSON.parse(fileData);
}
function loadRawState(file) {
    const loadedState = {
        ...state_1.AtemStateUtil.Create(),
        ...readJson(`./tally/${file}-state.json`),
    };
    if (!loadedState.info.capabilities) {
        const emptyState = (0, util_1.createEmptyState)();
        loadedState.info.capabilities = emptyState.info.capabilities;
    }
    // Fix up older video states
    if (!loadedState.video.mixEffects) {
        const videoState = loadedState.video;
        videoState.mixEffects = videoState.ME;
    }
    loadedState.video.mixEffects.forEach((me) => {
        // Lazy fix up moving some state properties
        if (me) {
            const me1 = me;
            if (typeof me.transitionPosition === 'number') {
                me.transitionPosition = {
                    inTransition: me1.inTransition,
                    handlePosition: me1.transitionPosition,
                    remainingFrames: me1.transitionFramesLeft,
                };
                delete me1.transitionFramesLeft;
                delete me1.inTransition;
            }
            if (typeof me.transitionProperties.selection === 'number') {
                ;
                me.transitionProperties.selection = (0, atemUtil_1.getComponents)(me.transitionProperties.selection);
            }
            if (typeof me.transitionProperties.nextSelection === 'number') {
                ;
                me.transitionProperties.nextSelection = (0, atemUtil_1.getComponents)(me.transitionProperties.nextSelection);
            }
        }
    });
    return loadedState;
}
function loadTally(file) {
    const rawTally = readJson(`./tally/${file}-tally.json`);
    const program = [];
    const preview = [];
    for (const id in rawTally) {
        const elm = rawTally[id];
        if (elm && elm.program) {
            program.push(Number(id));
        }
        if (elm && elm.preview) {
            preview.push(Number(id));
        }
    }
    return {
        program: program.sort(),
        preview: preview.sort(),
    };
}
function runTestMe1(name, filename) {
    const rawTally = loadTally(filename);
    const rawState = loadRawState(filename);
    test(`${name} - program`, () => {
        const res = (0, tally_1.listVisibleInputs)('program', rawState, 0).sort();
        expect(res).toEqual(rawTally.program);
    });
    test(`${name} - preview`, () => {
        const res = (0, tally_1.listVisibleInputs)('preview', rawState, 0).sort();
        expect(res).toEqual(rawTally.preview);
    });
}
describe('tally', () => {
    /**
     * Test cases can be generated with the dump.js script.
     * These tests compare listVisibleInputs against the atem TlSr command
     */
    runTestMe1('dsk active', 'dsk-active');
    runTestMe1('dsk in auto', 'dsk-in-auto');
    runTestMe1('ssrc', 'ssrc');
    runTestMe1('ssrc2', 'ssrc2');
    runTestMe1('upstream keyers', 'upstream-keyers');
    runTestMe1('mid wipe - no border', 'mid-wipe-no-border');
    runTestMe1('mid wipe - with border', 'mid-wipe-with-border');
    runTestMe1('mid dip', 'mid-dip');
    runTestMe1('mid sting', 'mid-trans-sting');
    runTestMe1('mid dve - no inputs', 'mid-trans-dve');
    runTestMe1('mid dve - with fill', 'mid-trans-dve-with-fill');
    runTestMe1('mid dve - with fill and key', 'mid-trans-dve-with-fill-and-key');
    runTestMe1('preview transition', 'preview-trans');
    runTestMe1('mid preview transition', 'mid-preview-trans');
    runTestMe1('chain me2 pgm', 'chain-me2-pgm');
    runTestMe1('chain me2 pvw', 'chain-me2-pvw');
    runTestMe1('me2 in ssrc', 'me2-in-ssrc');
});
//# sourceMappingURL=tally.spec.js.map