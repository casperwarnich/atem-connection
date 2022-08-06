"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataTransferCommands = require("../../commands/DataTransfer");
const fs_1 = require("fs");
const path = require("path");
const __1 = require("..");
function specToCommandClass(spec) {
    for (const commandName in DataTransferCommands) {
        if (spec.name === commandName) {
            const cmdCons = DataTransferCommands[commandName];
            const cmd = new cmdCons(spec.properties);
            if ('_properties' in cmd) {
                cmd._properties = spec.properties;
            }
            else {
                cmd.properties = spec.properties;
            }
            return cmd;
        }
    }
    return undefined;
}
function mangleCommand(cmd, dir) {
    const props = { ...cmd.properties };
    Object.keys(props).forEach((k) => {
        if (Buffer.isBuffer(props[k])) {
            const buf = props[k];
            props[k] = { bufferLength: buf.length };
        }
    });
    return {
        name: cmd.constructor.name,
        properties: props,
        direction: dir,
    };
}
function runDataTransferTest(spec) {
    const manager = new __1.DataTransferManager((cmds) => cmds.map(async (cmd) => {
        const expectedCmd = spec.shift();
        const gotCmd = mangleCommand(cmd, 'send');
        expect(gotCmd).toEqual(expectedCmd);
        while (spec.length > 0) {
            if (spec[0].direction !== 'recv')
                break;
            const nextCmd = spec.shift();
            const nextCmd2 = specToCommandClass(nextCmd);
            if (!nextCmd2)
                throw new Error(`Failed specToCommandClass ${nextCmd.name}`);
            manager.queueHandleCommand(nextCmd2);
        }
        return Promise.resolve();
    }));
    manager.startCommandSending(true);
    return manager;
}
test('Still upload', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './upload-still-sequence.json')).toString());
    const newBuffer = Buffer.alloc(1920 * 1080 * 4, 0);
    const manager = runDataTransferTest(spec);
    await manager.uploadStill(2, newBuffer, 'some still', '');
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
});
test('Wav upload', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './upload-wav-sequence.json')).toString());
    const newBuffer = (0, fs_1.readFileSync)(path.join(__dirname, './sampleAudio.wav'));
    const manager = runDataTransferTest(spec);
    await manager.uploadAudio(1, newBuffer, 'audio file');
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
});
test('clip upload', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './upload-clip-sequence.json')).toString());
    const newBuffer = Buffer.alloc(1920 * 1080 * 4, 0);
    const manager = runDataTransferTest(spec);
    await manager.uploadClip(1, [newBuffer, newBuffer, newBuffer], 'clip file');
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
}, 10000);
test('multiviewer label', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './upload-multiviewer-sequence.json')).toString());
    const newBuffer = Buffer.alloc(320 * 90);
    const manager = runDataTransferTest(spec);
    await manager.uploadMultiViewerLabel(11001, newBuffer);
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
}, 10000);
test('macro download', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './download-macro-sequence.json')).toString());
    const manager = runDataTransferTest(spec);
    await manager.downloadMacro(4);
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
}, 10000);
test('macro upload', async () => {
    const spec = JSON.parse((0, fs_1.readFileSync)(path.join(__dirname, './upload-macro-sequence.json')).toString());
    const manager = runDataTransferTest(spec);
    await manager.uploadMacro(4, Buffer.alloc(400), 'test macro');
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Nothing should be left by this point
    expect(spec).toHaveLength(0);
}, 10000);
//# sourceMappingURL=index.spec.js.map