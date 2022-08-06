"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('dgram');
const atemSocketChild_1 = require("../atemSocketChild");
const fakeTimers = require("@sinonjs/fake-timers");
const atem_1 = require("../../atem");
const ADDRESS = '127.0.0.1';
function getSocket(child) {
    const socket = child._socket;
    expect(socket).toBeTruthy();
    expect(socket.isOpen).toBeTruthy();
    socket.expectedAddress = ADDRESS;
    socket.expectedPort = atem_1.DEFAULT_PORT;
    return socket;
}
function getState(child) {
    return child._connectionState;
}
function getInflightIds(child) {
    return child._inFlight.map((p) => p.packetId);
}
function fakeConnect(child) {
    const child2 = child;
    child2._connectionState = atemSocketChild_1.ConnectionState.Established;
    child2._address = '127.0.0.1';
    child2.startTimers();
}
function createSocketChild(onCommandsReceived, onCommandsAcknowledged, onDisconnect) {
    return new atemSocketChild_1.AtemSocketChild({
        address: ADDRESS,
        port: atem_1.DEFAULT_PORT,
        debugBuffers: false,
    }, onDisconnect || (async () => Promise.resolve()), 
    // async msg => { console.log(msg) },
    async () => Promise.resolve(), onCommandsReceived || (async () => Promise.resolve()), onCommandsAcknowledged || (async () => Promise.resolve()));
}
describe('SocketChild', () => {
    let clock;
    beforeEach(() => {
        clock = fakeTimers.install();
    });
    afterEach(() => {
        clock.uninstall();
    });
    test('Establish connection', async () => {
        const child = createSocketChild();
        try {
            const socket = getSocket(child);
            let receivedPacket = false;
            socket.sendImpl = (msg) => {
                // Shouldnt only get one send
                expect(receivedPacket).toBeFalsy();
                receivedPacket = true;
                expect(msg).toEqual(atemSocketChild_1.COMMAND_CONNECT_HELLO);
            };
            expect(getState(child)).toEqual(atemSocketChild_1.ConnectionState.Closed);
            await child.connect(ADDRESS, atem_1.DEFAULT_PORT);
            // Ensure everything has ticked through
            clock.tick(20);
            // Confirm something was sent
            expect(receivedPacket).toBeTruthy();
            expect(getState(child)).toEqual(atemSocketChild_1.ConnectionState.SynSent);
            receivedPacket = false;
            socket.sendImpl = (msg) => {
                // Shouldnt only get one send
                expect(receivedPacket).toBeFalsy();
                receivedPacket = true;
                expect(msg).toEqual(Buffer.from([0x80, 0x0c, 0x53, 0x1b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
            };
            // Now get the connection established
            await socket.emitMessage(clock, Buffer.from([
                0x10,
                0x14,
                0x53,
                0x1b,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0xd1,
                0x00,
                0x00,
                0x02,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00, // Unknown Payload
            ]));
            // Ensure everything has ticked through
            await clock.tickAsync(20);
            // Confirm something was sent
            expect(receivedPacket).toBeTruthy();
            expect(getState(child)).toEqual(atemSocketChild_1.ConnectionState.Established);
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    function genAckRequestMessage(pktId, extraLength) {
        const buffer = Buffer.from([
            0x08,
            0x0c + (extraLength || 0),
            0x53,
            0x1b,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00, // Packet Id
        ]);
        buffer.writeUInt16BE(pktId, 10); // Packet Id
        return buffer;
    }
    test('Ack - delayed', async () => {
        const child = createSocketChild();
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            const acked = [];
            let gotUnknown = false;
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                if (opcode & atemSocketChild_1.PacketFlag.AckReply) {
                    acked.push(msg.readUInt16BE(4));
                }
                else {
                    gotUnknown = true;
                    // Shouldnt get any other sends
                    // expect(false).toBeTruthy()
                }
            };
            await socket.emitMessage(clock, genAckRequestMessage(1));
            // Nothing should have been sent immediately
            expect(acked).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Still nothing sent
            clock.tick(4);
            expect(acked).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Should be an ack a little later
            clock.tick(10);
            expect(acked).toEqual([1]);
            expect(gotUnknown).toBeFalse();
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('Ack - bulk', async () => {
        const child = createSocketChild();
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            let acked = [];
            let gotUnknown = false;
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                if (opcode & atemSocketChild_1.PacketFlag.AckReply) {
                    acked.push(msg.readUInt16BE(4));
                }
                else {
                    gotUnknown = true;
                    // Shouldnt get any other sends
                    // expect(false).toBeTruthy()
                }
            };
            for (let i = 1; i <= 15; i++) {
                await socket.emitMessage(clock, genAckRequestMessage(i));
            }
            // Nothing should have been sent yet
            await clock.tickAsync(4);
            expect(acked).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // One more will trigger an ack
            await socket.emitMessage(clock, genAckRequestMessage(16));
            expect(acked).toEqual([16]);
            expect(gotUnknown).toBeFalse();
            acked = [];
            // Nothing more should be acked
            clock.tick(10);
            expect(acked).toEqual([]);
            expect(gotUnknown).toBeFalse();
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('Inbound commands', async () => {
        let gotCmds = [];
        const child = createSocketChild(async (buf) => {
            gotCmds.push(buf.length);
            return Promise.resolve();
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            let gotUnknown = false;
            socket.sendImpl = (_msg) => {
                gotUnknown = true;
                // Shouldnt get any other sends
                expect(false).toBeTruthy();
            };
            gotCmds = [];
            // Nothing
            await socket.emitMessage(clock, genAckRequestMessage(1));
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Some payload
            const buffer = Buffer.concat([genAckRequestMessage(2, 1), Buffer.from([0])]);
            await socket.emitMessage(clock, buffer);
            expect(gotCmds).toEqual([1]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Repeated should not re-emit
            await socket.emitMessage(clock, buffer);
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Previous should not re-emit
            await socket.emitMessage(clock, Buffer.concat([genAckRequestMessage(1, 1), Buffer.from([0])]));
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Another payload
            await socket.emitMessage(clock, Buffer.concat([genAckRequestMessage(3, 1), Buffer.from([0])]));
            expect(gotCmds).toEqual([1]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('Inbound commands - around wrap', async () => {
        let gotCmds = [];
        const child = createSocketChild(async (buf) => {
            gotCmds.push(buf.length);
            return Promise.resolve();
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._lastReceivedPacketId = 32766; // 32767 is max
            let gotUnknown = false;
            socket.sendImpl = (_msg) => {
                gotUnknown = true;
                // Shouldnt get any other sends
                expect(false).toBeTruthy();
            };
            gotCmds = [];
            // Nothing
            await socket.emitMessage(clock, Buffer.concat([genAckRequestMessage(32766, 1), Buffer.from([0])]));
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            // Some payload
            const lastBuffer = Buffer.concat([genAckRequestMessage(32767, 1), Buffer.from([0])]);
            await socket.emitMessage(clock, lastBuffer);
            expect(gotCmds).toEqual([1]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Should not re-emit
            await socket.emitMessage(clock, lastBuffer);
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Now it has wrapped
            const firstBuffer = Buffer.concat([genAckRequestMessage(0, 1), Buffer.from([0])]);
            await socket.emitMessage(clock, firstBuffer);
            expect(gotCmds).toEqual([1]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Next buffer
            await socket.emitMessage(clock, Buffer.concat([genAckRequestMessage(1, 1), Buffer.from([0])]));
            expect(gotCmds).toEqual([1]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Should not re-emit
            await socket.emitMessage(clock, firstBuffer);
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Retransmit of lastBuffer is not uncommon, it should not re-emit
            await socket.emitMessage(clock, lastBuffer);
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
            // Ensure that the first buffer still does not re-emit
            await socket.emitMessage(clock, firstBuffer);
            expect(gotCmds).toEqual([]);
            expect(gotUnknown).toBeFalse();
            gotCmds = [];
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('SendCommands', async () => {
        const child = createSocketChild();
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 123;
            let received = [];
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                expect(opcode).toEqual(atemSocketChild_1.PacketFlag.AckRequest);
                received.push({
                    id: msg.readUInt16BE(10),
                    payload: msg.slice(12),
                });
            };
            // Send something
            const buf1 = [0, 1, 2];
            const cmdName = 'test';
            const buf1Expected = Buffer.alloc(11);
            buf1Expected.writeUInt16BE(buf1Expected.length, 0);
            buf1Expected.write(cmdName, 4, 4);
            Buffer.from(buf1).copy(buf1Expected, 8);
            child.sendCommands([{ payload: buf1, rawName: cmdName, trackingId: 1 }]);
            expect(received).toEqual([
                {
                    id: 123,
                    payload: buf1Expected,
                },
            ]);
            received = [];
            expect(getInflightIds(child)).toEqual([123]);
            // Send another
            child.sendCommands([{ payload: buf1, rawName: cmdName, trackingId: 1 }]);
            expect(received).toEqual([
                {
                    id: 124,
                    payload: buf1Expected,
                },
            ]);
            received = [];
            expect(getInflightIds(child)).toEqual([123, 124]);
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    function genAckCommandMessage(pktId) {
        const buffer = Buffer.from([
            0x80,
            0x0c,
            0x53,
            0x1b,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00, // No Packet Id
        ]);
        buffer.writeUInt16BE(pktId, 4); // Acked Id
        return buffer;
    }
    test('SendCommand - acks', async () => {
        let acked = [];
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 123;
            let received = [];
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                expect(opcode).toEqual(atemSocketChild_1.PacketFlag.AckRequest);
                received.push(msg.readUInt16BE(10));
            };
            acked = [];
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 },
                { payload: buf1, rawName: '', trackingId: 7 },
            ]);
            child.sendCommands([{ payload: buf1, rawName: '', trackingId: 8 }]);
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 9 },
                { payload: buf1, rawName: '', trackingId: 10 },
            ]);
            expect(received).toEqual([123, 124, 125, 126, 127, 128]);
            received = [];
            expect(getInflightIds(child)).toEqual([123, 124, 125, 126, 127, 128]);
            expect(acked).toEqual([]);
            // Ack a couple
            await socket.emitMessage(clock, genAckCommandMessage(125));
            expect(getInflightIds(child)).toEqual([126, 127, 128]);
            expect(acked).toEqual([
                { packetId: 123, trackingId: 5 },
                { packetId: 124, trackingId: 6 },
                { packetId: 125, trackingId: 7 },
            ]);
            acked = [];
            // Another ack
            await socket.emitMessage(clock, genAckCommandMessage(126));
            expect(getInflightIds(child)).toEqual([127, 128]);
            expect(acked).toEqual([{ packetId: 126, trackingId: 8 }]);
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('SendCommand - acks wrap', async () => {
        let acked = [];
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32764; // 32767 is max
            let received = [];
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                expect(opcode).toEqual(atemSocketChild_1.PacketFlag.AckRequest);
                received.push(msg.readUInt16BE(10));
            };
            acked = [];
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 },
                { payload: buf1, rawName: '', trackingId: 7 }, // 32766
            ]);
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 8 }, // 32767
            ]);
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 9 },
                { payload: buf1, rawName: '', trackingId: 10 }, // 1
            ]);
            expect(received).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            received = [];
            expect(getInflightIds(child)).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            expect(acked).toEqual([]);
            // Ack a couple
            await socket.emitMessage(clock, genAckCommandMessage(32766));
            expect(getInflightIds(child)).toEqual([32767, 0, 1]);
            expect(acked).toEqual([
                { packetId: 32764, trackingId: 5 },
                { packetId: 32765, trackingId: 6 },
                { packetId: 32766, trackingId: 7 },
            ]);
            acked = [];
            // Another ack
            await socket.emitMessage(clock, genAckCommandMessage(0));
            expect(getInflightIds(child)).toEqual([1]);
            expect(acked).toEqual([
                { packetId: 32767, trackingId: 8 },
                { packetId: 0, trackingId: 9 },
            ]);
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('SendCommand - retransmit timeouts', async () => {
        let acked = [];
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32764; // 32767 is max
            let received = [];
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                expect(opcode).toEqual(atemSocketChild_1.PacketFlag.AckRequest);
                received.push(msg.readUInt16BE(10));
            };
            acked = [];
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 },
                { payload: buf1, rawName: '', trackingId: 7 },
                { payload: buf1, rawName: '', trackingId: 8 },
                { payload: buf1, rawName: '', trackingId: 9 },
                { payload: buf1, rawName: '', trackingId: 10 }, // 1
            ]);
            expect(received).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            received = [];
            expect(getInflightIds(child)).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            expect(acked).toEqual([]);
            // Ack a couple to ensure socket is running properly
            await socket.emitMessage(clock, genAckCommandMessage(32765));
            expect(getInflightIds(child)).toEqual([32766, 32767, 0, 1]);
            expect(acked).toEqual([
                { packetId: 32764, trackingId: 5 },
                { packetId: 32765, trackingId: 6 },
            ]);
            acked = [];
            expect(received).toEqual([]);
            received = [];
            // Let the commands be resent
            await clock.tickAsync(80);
            expect(received).toEqual([32766, 32767, 0, 1]);
            received = [];
            // Should keep happening
            await clock.tickAsync(80);
            expect(received).toEqual([32766, 32767, 0, 1]);
            received = [];
            // Add another to the queue
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 11 }, // 2
            ]);
            expect(received).toEqual([2]);
            received = [];
            expect(getInflightIds(child)).toEqual([32766, 32767, 0, 1, 2]);
            expect(acked).toEqual([]);
            // And again, this time with the new thing
            await clock.tickAsync(80);
            expect(received).toEqual([32766, 32767, 0, 1, 2]);
            received = [];
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    function genRetransmitRequestCommandMessage(pktId) {
        const buffer = Buffer.from([
            0x40,
            0x0c,
            0x53,
            0x1b,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00, // No Packet Id
        ]);
        buffer.writeUInt16BE(pktId, 6); // retransmit Id
        return buffer;
    }
    test('SendCommand - retransmit request', async () => {
        let acked = [];
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32764; // 32767 is max
            let received = [];
            socket.sendImpl = (msg) => {
                const opcode = msg.readUInt8(0) >> 3;
                expect(opcode).toEqual(atemSocketChild_1.PacketFlag.AckRequest);
                received.push(msg.readUInt16BE(10));
            };
            acked = [];
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 },
                { payload: buf1, rawName: '', trackingId: 7 },
                { payload: buf1, rawName: '', trackingId: 8 },
                { payload: buf1, rawName: '', trackingId: 9 },
                { payload: buf1, rawName: '', trackingId: 10 }, // 1
            ]);
            expect(received).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            received = [];
            expect(getInflightIds(child)).toEqual([32764, 32765, 32766, 32767, 0, 1]);
            expect(acked).toEqual([]);
            // Ack a couple to ensure socket is running properly
            await socket.emitMessage(clock, genAckCommandMessage(32765));
            expect(getInflightIds(child)).toEqual([32766, 32767, 0, 1]);
            expect(acked).toEqual([
                { packetId: 32764, trackingId: 5 },
                { packetId: 32765, trackingId: 6 },
            ]);
            acked = [];
            expect(received).toEqual([]);
            received = [];
            // The device asks for a retransmit
            await socket.emitMessage(clock, genRetransmitRequestCommandMessage(32766));
            expect(received).toEqual([32766, 32767, 0, 1]);
            received = [];
            // And again
            await socket.emitMessage(clock, genRetransmitRequestCommandMessage(32767));
            expect(received).toEqual([32767, 0, 1]);
            received = [];
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('SendCommand - retransmit request future', async () => {
        const acked = [];
        let connected = true;
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        }, async () => {
            connected = false;
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32767; // 32767 is max
            connected = true;
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 }, // 0
            ]);
            expect(getInflightIds(child)).toEqual([32767, 0]);
            expect(acked).toEqual([]);
            expect(connected).toBeTrue();
            // The device asks for a retransmit of a future packet
            await socket.emitMessage(clock, genRetransmitRequestCommandMessage(1));
            expect(getInflightIds(child)).toEqual([]);
            expect(connected).toBeFalse();
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('SendCommand - retransmit request previous', async () => {
        const acked = [];
        let connected = true;
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        }, async () => {
            connected = false;
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32767; // 32767 is max
            connected = true;
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 }, // 0
            ]);
            expect(getInflightIds(child)).toEqual([32767, 0]);
            expect(acked).toEqual([]);
            expect(connected).toBeTrue();
            // The device asks for a retransmit of a past packet
            await socket.emitMessage(clock, genRetransmitRequestCommandMessage(32766));
            expect(getInflightIds(child)).toEqual([]);
            expect(connected).toBeFalse();
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
    test('Reconnect timer', async () => {
        let acked = [];
        let connected = true;
        const child = createSocketChild(undefined, async (ids) => {
            acked.push(...ids);
        }, async () => {
            connected = false;
        });
        try {
            fakeConnect(child);
            const socket = getSocket(child);
            child._nextSendPacketId = 32767; // 32767 is max
            connected = true;
            acked = [];
            // Send some stuff
            const buf1 = [0, 1, 2];
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 5 },
                { payload: buf1, rawName: '', trackingId: 6 }, // 0
            ]);
            expect(getInflightIds(child)).toEqual([32767, 0]);
            expect(acked).toEqual([]);
            expect(connected).toBeTrue();
            // Ack a couple to ensure socket is running properly
            await socket.emitMessage(clock, genAckCommandMessage(0));
            expect(getInflightIds(child)).toEqual([]);
            expect(acked).toEqual([
                { packetId: 32767, trackingId: 5 },
                { packetId: 0, trackingId: 6 },
            ]);
            acked = [];
            // Tick to let the timer execute
            await clock.tickAsync(1500);
            expect(connected).toBeTrue();
            expect(getInflightIds(child)).toEqual([]);
            expect(acked).toEqual([]);
            // Still nothing
            await clock.tickAsync(1500);
            expect(connected).toBeTrue();
            expect(getInflightIds(child)).toEqual([]);
            expect(acked).toEqual([]);
            // Not quite
            await clock.tickAsync(1990);
            expect(connected).toBeTrue();
            child.sendCommands([
                { payload: buf1, rawName: '', trackingId: 7 }, // 1
            ]);
            expect(getInflightIds(child)).toEqual([1]);
            expect(acked).toEqual([]);
            // Timeout
            await clock.tickAsync(20);
            expect(connected).toBeFalse();
            expect(getInflightIds(child)).toEqual([]);
            expect(acked).toEqual([]);
        }
        finally {
            if (child) {
                // Try and cleanup any timers
                await child.disconnect();
            }
        }
    });
});
//# sourceMappingURL=socket-child.spec.js.map