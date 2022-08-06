"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/ban-types */
const commands_1 = require("../../commands");
const enums_1 = require("../../enums");
const atemSocket_1 = require("../atemSocket");
const threadedclass_1 = require("threadedclass");
const buffer_1 = require("buffer");
const fakeTimers = require("@sinonjs/fake-timers");
const atemSocketChild_1 = require("../atemSocketChild");
// import { promisify } from 'util'
jest.mock('../atemSocketChild');
// @ts-ignore
class AtemSocketChildMock {
    constructor() {
        // this._debug = options.debug
        // this._address = options.address
        // this._port = options.port
        this.connect = jest.fn(async () => Promise.resolve());
        this.disconnect = jest.fn(async () => Promise.resolve());
        this.sendCommands = jest.fn(async () => Promise.resolve());
        this.onDisconnect = async () => Promise.resolve();
        this.onLog = async (msg) => console.log(msg);
        this.onCommandsReceived = async () => Promise.resolve();
        this.onCommandsAcknowledged = async () => Promise.resolve();
    }
}
const AtemSocketChildSingleton = new AtemSocketChildMock();
atemSocketChild_1.AtemSocketChild.mockImplementation((_opts, onDisconnect, onLog, onCommandsReceived, onCommandsAcknowledged) => {
    AtemSocketChildSingleton.onDisconnect = onDisconnect;
    AtemSocketChildSingleton.onLog = onLog;
    AtemSocketChildSingleton.onCommandsReceived = onCommandsReceived;
    AtemSocketChildSingleton.onCommandsAcknowledged = onCommandsAcknowledged;
    return AtemSocketChildSingleton;
});
class ThreadedClassManagerMock {
    constructor() {
        this.handlers = [];
    }
    onEvent(_socketProcess, _event, cb) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        ThreadedClassManagerSingleton.handlers.push(cb);
        return {
            stop: () => {
                // Ignore
            },
        };
    }
}
const ThreadedClassManagerSingleton = new ThreadedClassManagerMock();
jest.spyOn(threadedclass_1.ThreadedClassManager, 'onEvent').mockImplementation(ThreadedClassManagerSingleton.onEvent);
describe('AtemSocket', () => {
    let clock;
    function mockClear(lite) {
        ;
        atemSocketChild_1.AtemSocketChild.mockClear();
        AtemSocketChildSingleton.connect.mockClear();
        AtemSocketChildSingleton.disconnect.mockClear();
        AtemSocketChildSingleton.sendCommands.mockClear();
        if (!lite) {
            AtemSocketChildSingleton.onLog = async () => Promise.resolve();
            AtemSocketChildSingleton.onDisconnect = async () => Promise.resolve();
            AtemSocketChildSingleton.onCommandsAcknowledged = async () => Promise.resolve();
            AtemSocketChildSingleton.onCommandsReceived = async () => Promise.resolve();
        }
    }
    beforeEach(() => {
        clock = fakeTimers.install();
        mockClear();
        ThreadedClassManagerSingleton.handlers = [];
    });
    afterEach(() => {
        clock.uninstall();
    });
    function createSocket() {
        return new atemSocket_1.AtemSocket({
            debugBuffers: false,
            address: '',
            port: 890,
            disableMultithreaded: true,
            childProcessTimeout: 100,
        });
    }
    function getChild(socket) {
        return socket._socketProcess;
    }
    test('connect initial', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        expect(socket._address).toEqual('');
        expect(socket._port).toEqual(890);
        expect(getChild(socket)).toBeTruthy();
        // Connect was not called explicitly
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
        // New child was constructed
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(1);
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledWith({ address: '', port: 890, debugBuffers: false }, expect.toBeFunction(), expect.toBeFunction(), expect.toBeFunction(), expect.toBeFunction());
    });
    test('connect initial with params', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect('abc', 765);
        expect(socket._address).toEqual('abc');
        expect(socket._port).toEqual(765);
        expect(getChild(socket)).toBeTruthy();
        // Connect was not called explicitly
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
        // New child was constructed
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(1);
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledWith({ address: 'abc', port: 765, debugBuffers: false }, expect.toBeFunction(), expect.toBeFunction(), expect.toBeFunction(), expect.toBeFunction());
    });
    test('connect change details', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        expect(socket._address).toEqual('');
        expect(socket._port).toEqual(890);
        expect(getChild(socket)).toBeTruthy();
        // Connect was not called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
        mockClear();
        await socket.connect('new', 455);
        expect(socket._address).toEqual('new');
        expect(socket._port).toEqual(455);
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledWith('new', 455);
    });
    test('nextCommandTrackingId', () => {
        const socket = createSocket();
        expect(socket.nextCommandTrackingId).toEqual(1);
        expect(socket.nextCommandTrackingId).toEqual(2);
        expect(socket.nextCommandTrackingId).toEqual(3);
    });
    test('disconnect', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        expect(getChild(socket)).toBeTruthy();
        mockClear();
        await socket.disconnect();
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledWith();
    });
    test('disconnect - not open', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.disconnect();
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
    });
    test('sendCommand - not open', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        const cmd = new commands_1.CutCommand(0);
        await expect(socket.sendCommands([{ rawCommand: cmd, trackingId: 1 }])).rejects.toEqual(new Error('Socket process is not open'));
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
    });
    test('sendCommand - not serializable', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear();
        expect(getChild(socket)).toBeTruthy();
        const cmd = new commands_1.ProductIdentifierCommand({
            model: enums_1.Model.OneME,
            productIdentifier: 'ATEM OneME',
        });
        expect(cmd.serialize).toBeFalsy();
        await expect(socket.sendCommands([{ rawCommand: cmd, trackingId: 1 }])).rejects.toEqual(new Error('Command ProductIdentifierCommand is not serializable'));
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(0);
    });
    test('sendCommand', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear();
        expect(getChild(socket)).toBeTruthy();
        class MockCommand extends commands_1.BasicWritableCommand {
            serialize() {
                return buffer_1.Buffer.from('test payload');
            }
        }
        MockCommand.rawName = 'TEST';
        const cmd = new MockCommand({});
        const cmdId = 836;
        await socket.sendCommands([{ rawCommand: cmd, trackingId: cmdId }]);
        // connect was called explicitly
        expect(atemSocketChild_1.AtemSocketChild).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.connect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.disconnect).toHaveBeenCalledTimes(0);
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledTimes(1);
        const expectedBuffer = [...cmd.serialize()];
        expect(AtemSocketChildSingleton.sendCommands).toHaveBeenCalledWith([
            {
                payload: expectedBuffer,
                rawName: 'TEST',
                trackingId: cmdId,
            },
        ]);
    });
    test('events', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        expect(getChild(socket)).toBeTruthy();
        const disconnect = jest.fn();
        // const log = jest.fn()
        const ack = jest.fn();
        socket.on('disconnect', disconnect);
        socket.on('commandsAck', ack);
        expect(AtemSocketChildSingleton.onDisconnect).toBeDefined();
        await AtemSocketChildSingleton.onDisconnect();
        await clock.tickAsync(0);
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(AtemSocketChildSingleton.onCommandsAcknowledged).toBeDefined();
        await AtemSocketChildSingleton.onCommandsAcknowledged([{ packetId: 675, trackingId: 98 }]);
        await clock.tickAsync(0);
        expect(ack).toHaveBeenCalledTimes(1);
        expect(ack).toHaveBeenCalledWith([98]);
    });
    test('receive - init complete', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        const parser = socket._commandParser;
        expect(parser).toBeTruthy();
        const parserSpy = jest.spyOn(parser, 'commandFromRawName');
        const testBuffer = buffer_1.Buffer.from([0, 8, 0, 0, ...buffer_1.Buffer.from('InCm', 'ascii')]);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(testBuffer, pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(0);
        expect(change).toHaveBeenCalledTimes(0);
        expect(parserSpy).toHaveBeenCalledTimes(0);
    });
    test('receive - protocol version', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        const parser = socket._commandParser;
        expect(parser).toBeTruthy();
        const parserSpy = jest.spyOn(parser, 'commandFromRawName');
        expect(parser.version).toEqual(enums_1.ProtocolVersion.V7_2); // Default
        const testBuffer = buffer_1.Buffer.from([0, 12, 0, 0, ...buffer_1.Buffer.from('_ver', 'ascii'), 0x01, 0x02, 0x03, 0x04]);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(testBuffer, pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(0);
        expect(change).toHaveBeenCalledTimes(1);
        expect(parserSpy).toHaveBeenCalledTimes(1);
        expect(parserSpy).toHaveBeenCalledWith('_ver');
        expect(parser.version).toEqual(0x01020304); // Parsed
        // A change with the command
        const expectedCmd = new commands_1.VersionCommand(0x01020304);
        expect(change).toHaveBeenCalledWith([expectedCmd]);
    });
    test('receive - multiple commands', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        const parser = socket._commandParser;
        expect(parser).toBeTruthy();
        const parserSpy = jest.spyOn(parser, 'commandFromRawName');
        expect(parser.version).toEqual(enums_1.ProtocolVersion.V7_2); // Default
        const expectedCmd1 = new commands_1.ProgramInputUpdateCommand(0, { source: 0x0123 });
        const expectedCmd2 = new commands_1.PreviewInputUpdateCommand(1, { source: 0x0444 });
        const testCmd1 = buffer_1.Buffer.from([
            0,
            12,
            0,
            0,
            ...buffer_1.Buffer.from(commands_1.ProgramInputUpdateCommand.rawName, 'ascii'),
            0x00,
            0x00,
            0x01,
            0x23,
        ]);
        const testCmd2 = buffer_1.Buffer.from([
            0,
            12,
            0,
            0,
            ...buffer_1.Buffer.from(commands_1.PreviewInputUpdateCommand.rawName, 'ascii'),
            0x01,
            0x00,
            0x04,
            0x44,
        ]);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(buffer_1.Buffer.concat([testCmd1, testCmd2]), pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(0);
        expect(change).toHaveBeenCalledTimes(1);
        expect(parserSpy).toHaveBeenCalledTimes(2);
        expect(parserSpy).toHaveBeenCalledWith(commands_1.ProgramInputUpdateCommand.rawName);
        expect(parserSpy).toHaveBeenCalledWith(commands_1.PreviewInputUpdateCommand.rawName);
        // A change with the command
        expect(change).toHaveBeenCalledWith([expectedCmd1, expectedCmd2]);
    });
    test('receive - empty buffer', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        const testBuffer = buffer_1.Buffer.alloc(0);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(testBuffer, pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(0);
        expect(change).toHaveBeenCalledTimes(0);
    });
    test('receive - corrupt', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        const testBuffer = buffer_1.Buffer.alloc(10, 0);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(testBuffer, pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(0);
        expect(change).toHaveBeenCalledTimes(0);
    });
    test('receive - deserialize error', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear(true);
        expect(getChild(socket)).toBeTruthy();
        const error = jest.fn();
        const change = jest.fn();
        socket.on('error', error);
        socket.on('commandsReceived', change);
        class BrokenCommand extends commands_1.DeserializedCommand {
            deserialize() {
                throw new Error('Broken command');
            }
            applyToState() {
                throw new Error('Method not implemented.');
            }
        }
        BrokenCommand.rawName = 'TEST';
        const parser = socket._commandParser;
        expect(parser).toBeTruthy();
        const parserSpy = jest.spyOn(parser, 'commandFromRawName');
        parserSpy.mockImplementationOnce(() => new BrokenCommand({}));
        // const expectedCmd1 = new ProgramInputUpdateCommand(0, { source: 0x0123 })
        const expectedCmd2 = new commands_1.PreviewInputUpdateCommand(1, { source: 0x0444 });
        const testCmd1 = buffer_1.Buffer.from([
            0,
            12,
            0,
            0,
            ...buffer_1.Buffer.from(commands_1.ProgramInputUpdateCommand.rawName, 'ascii'),
            0x00,
            0x00,
            0x01,
            0x23,
        ]);
        const testCmd2 = buffer_1.Buffer.from([
            0,
            12,
            0,
            0,
            ...buffer_1.Buffer.from(commands_1.PreviewInputUpdateCommand.rawName, 'ascii'),
            0x01,
            0x00,
            0x04,
            0x44,
        ]);
        const pktId = 822;
        expect(AtemSocketChildSingleton.onCommandsReceived).toBeDefined();
        await AtemSocketChildSingleton.onCommandsReceived(buffer_1.Buffer.concat([testCmd1, testCmd2]), pktId);
        await clock.tickAsync(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(change).toHaveBeenCalledTimes(1);
        expect(parserSpy).toHaveBeenCalledTimes(2);
        expect(parserSpy).toHaveBeenCalledWith(commands_1.ProgramInputUpdateCommand.rawName);
        expect(parserSpy).toHaveBeenCalledWith(commands_1.PreviewInputUpdateCommand.rawName);
        // The second command should have been a success
        expect(change).toHaveBeenCalledWith([expectedCmd2]);
        expect(error).toHaveBeenCalledWith('Failed to deserialize command: BrokenCommand: Error: Broken command');
    });
    test('receive - thread restart', async () => {
        const socket = createSocket();
        expect(getChild(socket)).toBeFalsy();
        await socket.connect();
        mockClear();
        expect(getChild(socket)).toBeTruthy();
        const connect = (socket.connect = jest.fn(async () => Promise.resolve()));
        const disconnected = jest.fn();
        socket.on('disconnect', disconnected);
        expect(ThreadedClassManagerSingleton.handlers).toHaveLength(2); // 2 eventHandlers: 1 for restart, 1 for thread_closed
        // simulate a restart
        ThreadedClassManagerSingleton.handlers.forEach((handler) => handler());
        expect(disconnected).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledTimes(1);
    });
    // testIgnore('receive - thread restart with error', async () => {
    // 	const socket = createSocket()
    // 	expect(getChild(socket)).toBeFalsy()
    // 	await socket.connect()
    // 	mockClear()
    // 	expect(getChild(socket)).toBeTruthy()
    // 	const connect = socket.connect = jest.fn(() => Promise.reject('soemthing'))
    // 	const restarted = jest.fn()
    // 	const error = jest.fn()
    // 	socket.on('restarted', restarted)
    // 	socket.on('error', error)
    // 	expect(ThreadedClassManagerSingleton.handlers).toHaveLength(1)
    // 	// simulate a restart
    // 	ThreadedClassManagerSingleton.handlers.forEach(handler => handler())
    // 	await promisify(setImmediate)()
    // 	expect(restarted).toHaveBeenCalledTimes(1)
    // 	expect(connect).toHaveBeenCalledTimes(1)
    // 	expect(error).toHaveBeenCalledTimes(1)
    // 	expect(error).toHaveBeenCalledWith('soemthing')
    // })
});
//# sourceMappingURL=atemSocket.spec.js.map