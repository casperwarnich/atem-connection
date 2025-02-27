"use strict";
var _DataTransferLockingQueue_storeId, _DataTransferLockingQueue_sendLockCommand;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransferSimpleQueue = exports.DataTransferLockingQueue = exports.DataTransferQueueBase = void 0;
const tslib_1 = require("tslib");
const dataTransfer_1 = require("./dataTransfer");
const DataTransfer_1 = require("../commands/DataTransfer");
const p_queue_1 = require("p-queue");
const debug0 = require("debug");
const debug = debug0('atem-connection:data-transfer:upload-buffer');
const queueHighPriority = 99;
class DataTransferQueueBase {
    constructor(nextTransferId) {
        this.taskQueue = [];
        this.handleCommandQueue = new p_queue_1.default({ concurrency: 1 });
        // this.queueCommands = queueCommands
        this.nextTransferId = nextTransferId;
    }
    get currentTransferId() {
        return this.activeTransfer?.id ?? null;
    }
    /** Clear the pending queue, and abort any in-progress transfers */
    clearQueueAndAbort(reason) {
        for (const transfer of this.taskQueue) {
            transfer.abort(reason);
        }
        this.taskQueue.splice(0, this.taskQueue.length);
        this.handleCommandQueue.clear();
        this.transferCompleted();
        if (this.activeTransfer) {
            this.activeTransfer.job.abort(reason);
            this.activeTransfer = undefined;
        }
    }
    /** Pop some queued commands from the active transfer */
    popQueuedCommands(maxCount) {
        if (this.activeTransfer) {
            if (this.activeTransfer.queuedCommands.length === 0 &&
                this.activeTransfer.state === dataTransfer_1.DataTransferState.Finished) {
                // This has now truely finished, so fire up the next thing
                // Transfer reports as having finished, so clear tracker and start the next
                this.transferCompleted();
                this.activeTransfer = undefined;
                this.dequeueAndRun();
                return [];
            }
            else {
                return this.activeTransfer.queuedCommands.splice(0, maxCount);
            }
        }
        else {
            return null;
        }
    }
    /** Queue a transfer to be performed */
    async enqueue(transfer) {
        this.taskQueue.push(transfer);
        if (!this.activeTransfer) {
            this.dequeueAndRun();
        }
        return transfer.promise;
    }
    dequeueAndRun() {
        if (this.activeTransfer === undefined) {
            const newTransfer = this.taskQueue.shift();
            if (newTransfer) {
                // Anything in the queue is rubbish now TODO - is this true? what about lock changes?
                this.handleCommandQueue.clear();
                const transferId = this.nextTransferId();
                this.activeTransfer = {
                    id: transferId,
                    state: dataTransfer_1.DataTransferState.Pending,
                    job: newTransfer,
                    queuedCommands: [],
                };
                this.tryStartTransfer();
            }
        }
    }
    /**
     * Try and start the 'activeTransfer' if it is sat at pending
     * This is done in the queue, and calls back out to this.startTransfer
     */
    tryStartTransfer() {
        if (this.activeTransfer) {
            this.handleCommandQueue
                .add(async () => {
                const transfer = this.activeTransfer;
                if (!transfer || transfer.state !== dataTransfer_1.DataTransferState.Pending) {
                    // No transfer to start
                    return;
                }
                const result = await this.startTransfer(transfer.job, transfer.id);
                // TODO - this is rather duplicated..
                if (this.activeTransfer?.id !== transfer.id) {
                    throw new Error('Transfer changed mid-handle!');
                }
                // Store the result
                transfer.state = result.newState;
                transfer.queuedCommands.push(...result.commands);
                // if (transfer.state === DataTransferState.)
                if (transfer.state === dataTransfer_1.DataTransferState.Finished && transfer.queuedCommands.length === 0) {
                    // Transfer reports as having finished, so clear tracker and start the next
                    this.transferCompleted();
                    this.activeTransfer = undefined;
                    this.dequeueAndRun();
                }
                else {
                    // Looks to be progressing along
                }
            }, { priority: queueHighPriority })
                .catch((e) => {
                // TODO - better
                console.error(`startTransfer failed: ${e}`);
            });
        }
    }
    /**
     * Try and abort the 'activeTransfer' if there is one
     */
    tryAbortTransfer(reason) {
        if (this.activeTransfer) {
            const transferId = this.activeTransfer.id;
            this.handleCommandQueue
                .add(async () => {
                const transfer = this.activeTransfer;
                if (!transfer || transfer.id !== transferId) {
                    // Wrong transfer to abort
                    return;
                }
                transfer.job.abort(reason);
                this.transferCompleted();
                this.activeTransfer = undefined;
                this.dequeueAndRun();
            }, { priority: queueHighPriority })
                .catch((e) => {
                // TODO - better
                console.error(`abortTransfer failed: ${e}`);
            });
        }
    }
    handleCommand(command) {
        this.handleCommandQueue
            .add(async () => {
            const transfer = this.activeTransfer;
            if (!transfer || transfer.id !== command.properties.transferId) {
                // The id changed while this was queued. Hopefully safe to discard it
                return;
            }
            if (transfer.state === dataTransfer_1.DataTransferState.Pending) {
                // Transfer has not sent its init, so ignore
                return;
            }
            const oldState = transfer.state;
            const result = await transfer.job.handleCommand(command, oldState);
            if (this.activeTransfer?.id !== transfer.id) {
                throw new Error('Transfer changed mid-handle!');
            }
            // Store the result
            transfer.state = result.newState;
            transfer.queuedCommands.push(...result.commands);
            if (transfer.state !== dataTransfer_1.DataTransferState.Finished && transfer.queuedCommands.length === 0) {
                // // Transfer reports as having finished, so clear tracker and start the next
                // this.transferCompleted()
                // this.activeTransfer = undefined
                // this.dequeueAndRun()
            }
            else {
                // Looks to be progressing along
                // If the transfer provided a new id, track it
                if (result.newId !== undefined) {
                    transfer.id = result.newId;
                }
            }
        })
            .catch((e) => {
            // TODO - better
            console.error(`Queue error: ${e}`);
        });
    }
}
exports.DataTransferQueueBase = DataTransferQueueBase;
class DataTransferLockingQueue extends DataTransferQueueBase {
    constructor(storeId, sendLockCommand, nextTransferId) {
        super(nextTransferId);
        _DataTransferLockingQueue_storeId.set(this, void 0);
        _DataTransferLockingQueue_sendLockCommand.set(this, void 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferLockingQueue_storeId, storeId, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferLockingQueue_sendLockCommand, sendLockCommand, "f");
        this.isLocked = false;
    }
    async startTransfer(transfer, transferId) {
        debug(`Starting transfer ${transferId} (Already locked = ${this.isLocked})`);
        if (this.isLocked) {
            // Get the transfer going immediately
            return transfer.startTransfer(transferId);
        }
        else {
            (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferLockingQueue_sendLockCommand, "f").call(this, new DataTransfer_1.LockStateCommand((0, tslib_1.__classPrivateFieldGet)(this, _DataTransferLockingQueue_storeId, "f"), true));
            // We need to lock the pool first
            return {
                newState: dataTransfer_1.DataTransferState.Pending,
                commands: [],
            };
        }
    }
    /** We have obtained the lock! */
    lockObtained() {
        this.isLocked = true;
        // Get the transfer started
        this.tryStartTransfer();
    }
    /** The status of the lock has changed */
    updateLock(locked) {
        this.isLocked = locked;
        if (!locked) {
            this.tryAbortTransfer(new Error('Lost lock mid-transfer'));
        }
    }
    transferCompleted() {
        if (this.isLocked) {
            // Make sure that we don't try to start the next before the unlock completes
            // TODO - is this durable?
            this.isLocked = false;
            debug(`Completing transfer`);
            // Unlock the pool
            (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferLockingQueue_sendLockCommand, "f").call(this, new DataTransfer_1.LockStateCommand((0, tslib_1.__classPrivateFieldGet)(this, _DataTransferLockingQueue_storeId, "f"), false));
        }
    }
}
exports.DataTransferLockingQueue = DataTransferLockingQueue;
_DataTransferLockingQueue_storeId = new WeakMap(), _DataTransferLockingQueue_sendLockCommand = new WeakMap();
class DataTransferSimpleQueue extends DataTransferQueueBase {
    async startTransfer(transfer, transferId) {
        return transfer.startTransfer(transferId);
    }
    transferCompleted() {
        // Nothing to do
    }
}
exports.DataTransferSimpleQueue = DataTransferSimpleQueue;
//# sourceMappingURL=dataTransferQueue.js.map