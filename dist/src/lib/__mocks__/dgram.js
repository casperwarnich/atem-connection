"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocket = exports.Socket = void 0;
/* eslint-disable jest/no-standalone-expect */
const events_1 = require("events");
require("jest-extended");
const atem_1 = require("../../atem");
class Socket extends events_1.EventEmitter {
    constructor() {
        super();
        this.isOpen = false;
    }
    async emitMessage(clock, msg) {
        expect(Buffer.isBuffer(msg)).toBeTruthy();
        const rinfo = {
            address: this.expectedAddress || '127.0.0.1',
            port: this.expectedPort || atem_1.DEFAULT_PORT,
            family: 'IPv4',
            size: msg.length,
        };
        this.emit('message', msg, rinfo);
        await clock.tickAsync(0);
    }
    bind(port, address, callback) {
        expect(port).toBeUndefined();
        expect(address).toBeUndefined();
        expect(callback).toBeUndefined();
        this.isOpen = true;
    }
    send(msg, offset, length, port, address, callback) {
        expect(Buffer.isBuffer(msg)).toBeTruthy();
        expect(offset).toBeNumber();
        expect(length).toBeNumber();
        expect(port).toBeNumber();
        expect(address).toBeString();
        expect(callback).toBeUndefined();
        if (this.expectedAddress) {
            expect(address).toEqual(this.expectedAddress);
        }
        if (this.expectedPort) {
            expect(port).toEqual(this.expectedPort);
        }
        if (this.sendImpl) {
            this.sendImpl(msg);
        }
    }
    close(cb) {
        this.isOpen = false;
        if (cb)
            cb();
    }
}
exports.Socket = Socket;
function createSocket(type, callback) {
    expect(type).toEqual('udp4');
    expect(callback).toBeUndefined();
    return new Socket();
}
exports.createSocket = createSocket;
//# sourceMappingURL=dgram.js.map