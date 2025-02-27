"use strict";
var _DataTransferUploadAudio_clipIndex, _DataTransferUploadAudio_name;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dataTransferUploadBuffer_1 = require("./dataTransferUploadBuffer");
const DataTransfer_1 = require("../commands/DataTransfer");
const dataTransfer_1 = require("./dataTransfer");
class DataTransferUploadAudio extends dataTransferUploadBuffer_1.DataTransferUploadBuffer {
    constructor(clipIndex, data, name) {
        super(data);
        _DataTransferUploadAudio_clipIndex.set(this, void 0);
        _DataTransferUploadAudio_name.set(this, void 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadAudio_clipIndex, clipIndex, "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadAudio_name, name, "f");
    }
    async startTransfer(transferId) {
        const command = new DataTransfer_1.DataTransferUploadRequestCommand({
            transferId: transferId,
            transferStoreId: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadAudio_clipIndex, "f") + 1,
            transferIndex: 0,
            size: this.data.length,
            mode: 256,
        });
        return {
            newState: dataTransfer_1.DataTransferState.Ready,
            commands: [command],
        };
    }
    generateDescriptionCommand(transferId) {
        return new DataTransfer_1.DataTransferFileDescriptionCommand({
            name: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadAudio_name, "f"),
            description: undefined,
            fileHash: this.hash,
            transferId: transferId,
        });
    }
}
exports.default = DataTransferUploadAudio;
_DataTransferUploadAudio_clipIndex = new WeakMap(), _DataTransferUploadAudio_name = new WeakMap();
//# sourceMappingURL=dataTransferUploadAudio.js.map