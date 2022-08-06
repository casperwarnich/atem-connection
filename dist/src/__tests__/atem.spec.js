"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/unbound-method */
const atem_1 = require("../atem");
const commands_1 = require("../commands");
const util_1 = require("util");
const events_1 = require("events");
const atemSocket_1 = require("../lib/atemSocket");
jest.mock('../lib/atemSocket.ts');
const setImmediatePromise = (0, util_1.promisify)(setImmediate);
class MockSocket extends events_1.EventEmitter {
    destroy() {
        // Nothing
    }
}
describe('Atem', () => {
    beforeEach(() => {
        ;
        atemSocket_1.AtemSocket.mockClear();
    });
    test('constructor test 1', async () => {
        const conn = new atem_1.Atem({ disableMultithreaded: true });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            expect(atemSocket_1.AtemSocket).toHaveBeenCalledTimes(1);
            expect(atemSocket_1.AtemSocket).toHaveBeenCalledWith({
                address: '',
                childProcessTimeout: 600,
                debugBuffers: false,
                disableMultithreaded: true,
                log: conn._log,
                port: atem_1.DEFAULT_PORT,
            });
        }
        finally {
            await conn.destroy();
        }
    });
    test('constructor test 2', async () => {
        const conn = new atem_1.Atem({ debugBuffers: true, address: 'test1', port: 23 });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            expect(atemSocket_1.AtemSocket).toHaveBeenCalledTimes(1);
            expect(atemSocket_1.AtemSocket).toHaveBeenCalledWith({
                address: 'test1',
                childProcessTimeout: 600,
                debugBuffers: true,
                disableMultithreaded: false,
                log: conn._log,
                port: 23,
            });
        }
        finally {
            await conn.destroy();
        }
    });
    test('connect', async () => {
        const conn = new atem_1.Atem({ debugBuffers: true, address: 'test1', port: 23 });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            socket.connect = jest.fn(() => Promise.resolve(5));
            const res = conn.connect('127.9.8.7', 98);
            expect(await res).toEqual(5);
            expect(socket.connect).toHaveBeenCalledTimes(1);
            expect(socket.connect).toHaveBeenCalledWith('127.9.8.7', 98);
        }
        finally {
            await conn.destroy();
        }
    });
    test('disconnect', async () => {
        const conn = new atem_1.Atem({ debugBuffers: true, address: 'test1', port: 23 });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            socket.disconnect = jest.fn(() => Promise.resolve(35));
            const res = await conn.disconnect();
            expect(res).toEqual(35);
            expect(socket.disconnect).toHaveBeenCalledTimes(1);
            expect(socket.disconnect).toHaveBeenCalledWith();
        }
        finally {
            await conn.destroy();
        }
    });
    test('sendCommand - good', async () => {
        ;
        atemSocket_1.AtemSocket.mockImplementation(() => new MockSocket());
        const conn = new atem_1.Atem({ debugBuffers: true, address: 'test1', port: 23 });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            let nextId = 123;
            Object.defineProperty(socket, 'nextCommandTrackingId', {
                get: jest.fn(() => nextId++),
                set: jest.fn(),
            });
            expect(socket.nextCommandTrackingId).toEqual(123);
            socket.sendCommands = jest.fn(() => Promise.resolve(35));
            const sentQueue = conn._sentQueue;
            expect(Object.keys(sentQueue)).toHaveLength(0);
            const cmd = new commands_1.CutCommand(0);
            const res = conn.sendCommand(cmd);
            await setImmediatePromise();
            expect(Object.keys(sentQueue)).toHaveLength(1);
            expect(socket.sendCommands).toHaveBeenCalledTimes(1);
            expect(socket.sendCommands).toHaveBeenCalledWith([
                {
                    rawCommand: cmd,
                    trackingId: 124,
                },
            ]);
            // Trigger the ack, and it should switfy resolve
            socket.emit('commandsAck', [124]);
            expect(Object.keys(sentQueue)).toHaveLength(0);
            // Finally, it should now resolve without a timeout
            expect(await res).toBeUndefined();
        }
        finally {
            await conn.destroy();
        }
    }, 500);
    test('sendCommand - send error', async () => {
        ;
        atemSocket_1.AtemSocket.mockImplementation(() => new MockSocket());
        const conn = new atem_1.Atem({ debugBuffers: true, address: 'test1', port: 23 });
        try {
            const socket = conn.socket;
            expect(socket).toBeTruthy();
            let nextId = 123;
            Object.defineProperty(socket, 'nextCommandTrackingId', {
                get: jest.fn(() => nextId++),
                set: jest.fn(),
            });
            expect(socket.nextCommandTrackingId).toEqual(123);
            socket.sendCommands = jest.fn(() => Promise.reject(35));
            const sentQueue = conn._sentQueue;
            expect(Object.keys(sentQueue)).toHaveLength(0);
            const cmd = new commands_1.CutCommand(0);
            const res = conn.sendCommand(cmd);
            // Send command should be called
            expect(socket.sendCommands).toHaveBeenCalledTimes(1);
            expect(socket.sendCommands).toHaveBeenCalledWith([
                {
                    rawCommand: cmd,
                    trackingId: 124,
                },
            ]);
            expect(Object.keys(sentQueue)).toHaveLength(0);
            // Finally, it should now resolve without a timeout
            // Should be the error thrown by sendCommand
            await expect(res).rejects.toBe(35);
            // expect(await res).toEqual(cmd)
        }
        finally {
            await conn.destroy();
        }
    }, 500);
});
//# sourceMappingURL=atem.spec.js.map