"use strict";
var _DataTransferUploadClip_clipIndex, _DataTransferUploadClip_name, _DataTransferUploadClip_frames, _DataTransferUploadClip_nextTransferId, _DataTransferUploadClip_currentFrame, _DataTransferUploadClip_numFrames, _DataTransferUploadClipFrame_clipIndex, _DataTransferUploadClipFrame_frameIndex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransferUploadClipFrame = exports.DataTransferUploadClip = void 0;
const tslib_1 = require("tslib");
const DataTransfer_1 = require("../commands/DataTransfer");
const dataTransfer_1 = require("./dataTransfer");
const dataTransferUploadBuffer_1 = require("./dataTransferUploadBuffer");
const Media_1 = require("../commands/Media");
const debug0 = require("debug");
const debug = debug0('atem-connection:data-transfer:upload-clip');
class DataTransferUploadClip extends dataTransfer_1.DataTransfer {
    constructor(clipIndex, name, frames, nextTransferId) {
        super();
        _DataTransferUploadClip_clipIndex.set(this, void 0);
        _DataTransferUploadClip_name.set(this, void 0);
        _DataTransferUploadClip_frames.set(this, void 0);
        _DataTransferUploadClip_nextTransferId.set(this, void 0);
        _DataTransferUploadClip_currentFrame.set(this, void 0);
        _DataTransferUploadClip_numFrames.set(this, 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_clipIndex, clipIndex, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_name, name, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_frames, frames, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_nextTransferId, nextTransferId, "f");
    }
    async nextFrame() {
        const next = await (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_frames, "f").next();
        return next.value;
    }
    async startTransfer(transferId) {
        var _a;
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_currentFrame, await this.nextFrame(), "f");
        if (!(0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f")) {
            throw new Error('No frames available for transfer');
        }
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_numFrames, (_a = (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_numFrames, "f"), _a++, _a), "f");
        const frameResult = await (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f").startTransfer(transferId);
        return {
            newState: dataTransfer_1.DataTransferState.Ready,
            commands: [new Media_1.MediaPoolClearClipCommand((0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_clipIndex, "f")), ...frameResult.commands],
        };
    }
    /** Restart the current transfer */
    async restartTransfer(transferId) {
        if ((0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f")) {
            return (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f").startTransfer(transferId);
        }
        else {
            // TODO - is this correct?
            return this.startTransfer(transferId);
        }
    }
    async handleCommand(command, oldState) {
        var _a;
        if (!(0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f")) {
            throw new Error('No frames available for transfer');
        }
        // TODO - is oldState appropriate here?
        const frameResult = await (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f").handleCommand(command, oldState);
        debug(`handleCommand: ${dataTransfer_1.DataTransferState[frameResult.newState]} - Giving ${frameResult.commands.length} commands`);
        if (frameResult.newState === dataTransfer_1.DataTransferState.Finished) {
            // Get the next frame
            (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_currentFrame, await this.nextFrame(), "f");
            debug(`Start next frame (${!!(0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f")})`);
            if ((0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f")) {
                (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClip_numFrames, (_a = (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_numFrames, "f"), _a++, _a), "f");
                const newId = (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_nextTransferId, "f").call(this);
                const newFrameResult = await (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_currentFrame, "f").startTransfer(newId);
                return {
                    newState: dataTransfer_1.DataTransferState.Ready,
                    newId: newId,
                    commands: [...frameResult.commands, ...newFrameResult.commands],
                };
            }
            else {
                // Looks like we finished
                this.resolvePromise();
                debug(`Clip complete`);
                return {
                    newState: dataTransfer_1.DataTransferState.Finished,
                    commands: [
                        ...frameResult.commands,
                        new Media_1.MediaPoolSetClipCommand({
                            index: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_clipIndex, "f"),
                            name: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_name, "f"),
                            frames: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClip_numFrames, "f"),
                        }),
                    ],
                };
            }
        }
        else {
            return {
                newState: dataTransfer_1.DataTransferState.Transferring,
                commands: frameResult.commands,
            };
        }
    }
}
exports.DataTransferUploadClip = DataTransferUploadClip;
_DataTransferUploadClip_clipIndex = new WeakMap(), _DataTransferUploadClip_name = new WeakMap(), _DataTransferUploadClip_frames = new WeakMap(), _DataTransferUploadClip_nextTransferId = new WeakMap(), _DataTransferUploadClip_currentFrame = new WeakMap(), _DataTransferUploadClip_numFrames = new WeakMap();
class DataTransferUploadClipFrame extends dataTransferUploadBuffer_1.DataTransferUploadBuffer {
    constructor(clipIndex, frameIndex, data) {
        super(data);
        _DataTransferUploadClipFrame_clipIndex.set(this, void 0);
        _DataTransferUploadClipFrame_frameIndex.set(this, void 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClipFrame_clipIndex, clipIndex, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadClipFrame_frameIndex, frameIndex, "f");
    }
    async startTransfer(transferId) {
        debug(`Start transfer ${transferId} (${this.data.length})`);
        const command = new DataTransfer_1.DataTransferUploadRequestCommand({
            transferId: transferId,
            transferStoreId: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClipFrame_clipIndex, "f") + 1,
            transferIndex: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadClipFrame_frameIndex, "f"),
            size: this.data.length,
            mode: 1,
        });
        return {
            newState: dataTransfer_1.DataTransferState.Ready,
            commands: [command],
        };
    }
    generateDescriptionCommand(transferId) {
        debug(`Generate frame description for transfer ${transferId}`);
        return new DataTransfer_1.DataTransferFileDescriptionCommand({
            name: undefined,
            description: undefined,
            fileHash: this.hash,
            transferId: transferId,
        });
    }
}
exports.DataTransferUploadClipFrame = DataTransferUploadClipFrame;
_DataTransferUploadClipFrame_clipIndex = new WeakMap(), _DataTransferUploadClipFrame_frameIndex = new WeakMap();
//# sourceMappingURL=dataTransferUploadClip.js.map