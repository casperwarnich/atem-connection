"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable jest/no-conditional-expect */
const fs_1 = require("fs");
const path_1 = require("path");
const atemSocketChild_1 = require("../lib/atemSocketChild");
const atem_1 = require("../atem");
const state_1 = require("../state");
const objectPath = require("object-path");
jest.mock('../lib/atemSocketChild');
function cloneJson(v) {
    return JSON.parse(JSON.stringify(v));
}
// @ts-ignore
class AtemSocketChildMock {
    constructor(onDisconnect, onLog, onCommandsReceived, onCommandsAcknowledged) {
        this.connect = jest.fn(async () => Promise.resolve());
        this.disconnect = jest.fn(async () => Promise.resolve());
        this.sendCommands = jest.fn(async () => Promise.resolve());
        this.onDisconnect = onDisconnect;
        this.onLog = onLog;
        this.onCommandsReceived = onCommandsReceived;
        this.onCommandsAcknowledged = onCommandsAcknowledged;
    }
}
;
atemSocketChild_1.AtemSocketChild.mockImplementation((_opts, onDisconnect, onLog, onCommandsReceived, onCommandsAcknowledged) => {
    return new AtemSocketChildMock(onDisconnect, onLog, onCommandsReceived, onCommandsAcknowledged);
});
function createConnection() {
    return new atem_1.BasicAtem({
        debugBuffers: false,
        address: '',
        port: 890,
        disableMultithreaded: true,
    });
}
function getChild(conn) {
    return conn.socket._socketProcess;
}
function runTest(name, filename) {
    const filePath = (0, path_1.resolve)(__dirname, `./connection/${filename}.data`);
    const fileData = (0, fs_1.readFileSync)(filePath).toString().split('\n');
    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
        test(`Connection`, async () => {
            const conn = createConnection();
            await conn.connect('');
            const child = getChild(conn);
            expect(child).toBeTruthy();
            expect(child.onCommandsReceived).toBeTruthy();
            const errors = [];
            conn.on('error', (e) => {
                // Ignore any errors that are due to bad ids, as they are 'good' errors
                if (!(e instanceof state_1.InvalidIdError)) {
                    errors.push(e);
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-for-in-array
            for (const i in fileData) {
                const buffer = Buffer.from(fileData[i].trim(), 'hex');
                await child.onCommandsReceived(buffer, Number(i));
            }
            expect(errors).toEqual([]);
        });
        describe('Paths', () => {
            const conn = createConnection();
            const parser = conn.socket._parseCommands.bind(conn.socket);
            const commands = [];
            // eslint-disable-next-line @typescript-eslint/no-for-in-array
            for (const i in fileData) {
                const buffer = Buffer.from(fileData[i].trim(), 'hex');
                commands.push(...parser(buffer));
            }
            const state = cloneJson(conn.state);
            // eslint-disable-next-line jest/no-standalone-expect
            expect(commands).not.toBeEmpty();
            // eslint-disable-next-line jest/no-standalone-expect
            expect(state).toBeTruthy();
            const state0 = state;
            for (const cmd of commands) {
                test(`${cmd.constructor.name}`, async () => {
                    const newState = cloneJson(state0);
                    try {
                        const paths0 = cmd.applyToState(newState);
                        const paths = Array.isArray(paths0) ? paths0 : [paths0];
                        switch (cmd.constructor.name) {
                            case 'TallyBySourceCommand':
                            case 'LockStateUpdateCommand':
                                // Some commands are not expected to update the state
                                break;
                            default:
                                expect(paths).not.toBeEmpty();
                                break;
                        }
                        // Ensure the paths are all valid
                        // const trimmedRawState = cloneJson(state0)
                        // const trimmedNewState = cloneJson(newState)
                        if (paths.length > 0) {
                            for (const path of paths) {
                                // Start by making sure that the paths are valid
                                const subObj = objectPath.get(newState, path);
                                expect(subObj).not.toBeUndefined();
                                // objectPath.del(trimmedNewState, path)
                                // objectPath.del(trimmedRawState, path)
                            }
                        }
                        // // Ensure nothing outside the paths changed
                        // TODO - this wont do much as the current state is too similar. Also it is horrifically slow
                        // expect(trimmedNewState).toEqual(trimmedRawState)
                    }
                    catch (e) {
                        if (e instanceof state_1.InvalidIdError) {
                            // Ignore it
                        }
                        else {
                            throw e;
                        }
                    }
                    //
                });
            }
        });
    });
}
describe('connection', () => {
    /**
     * Test cases can be generated with the dump.js script.
     * These tests run the payload through the parser to ensure that the commands does not error.
     */
    runTest('1me v8.1', '1me-v8.1');
    runTest('2me v8.1', '2me-v8.1');
    runTest('2me v8.1.2', '2me-v8.1.2');
    runTest('ps4k v7.2', 'ps4k-v7.2');
    runTest('1me4k v8.2', '1me4k-v8.2');
    runTest('2me4k v8.4', '2me4k-v8.4');
    runTest('4me4k v7.5.2', '4me4k-v7.5.2');
    runTest('4me4k v8.2', '4me4k-v8.2');
    runTest('tvshd v8.0.0', 'tvshd-v8.0.0');
    runTest('tvshd v8.1.0', 'tvshd-v8.1.0');
    runTest('tvshd v8.2.0', 'tvshd-v8.2.0');
    runTest('constellation v8.0.2', 'constellation-v8.0.2');
    runTest('constellation v8.2.3', 'constellation-v8.2.3');
    runTest('mini v8.1', 'mini-v8.1');
    runTest('mini v8.1.1', 'mini-v8.1.1');
    runTest('mini v8.6', 'mini-v8.6');
    runTest('mini pro v8.2', 'mini-pro-v8.2');
    runTest('mini pro iso v8.4', 'mini-pro-iso-v8.4');
    runTest('mini extreme v8.6', 'mini-extreme-v8.6');
    runTest('constellation hd 2me v8.7', 'constellation-2me-hd-v8.7.0');
});
//# sourceMappingURL=connection.spec.js.map