/// <reference types="node" />
import { EventEmitter } from 'events';
import { SocketType, RemoteInfo } from 'dgram';
import 'jest-extended';
import * as fakeTimers from '@sinonjs/fake-timers';
export declare class Socket extends EventEmitter {
    isOpen: boolean;
    expectedAddress?: string;
    expectedPort?: number;
    constructor();
    sendImpl?: (msg: Buffer) => void;
    emitMessage(clock: fakeTimers.Clock, msg: Buffer): Promise<void>;
    bind(port?: number, address?: string, callback?: () => void): void;
    send(msg: string | Uint8Array, offset: number, length: number, port: number, address?: string, callback?: (error: Error | null, bytes: number) => void): void;
    close(cb?: () => void): void;
}
export declare function createSocket(type: SocketType, callback?: (msg: Buffer, rinfo: RemoteInfo) => void): Socket;
//# sourceMappingURL=dgram.d.ts.map