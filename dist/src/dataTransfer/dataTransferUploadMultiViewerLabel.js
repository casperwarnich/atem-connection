"use strict";
var _DataTransferUploadMultiViewerLabel_sourceId;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dataTransferUploadBuffer_1 = require("./dataTransferUploadBuffer");
const DataTransfer_1 = require("../commands/DataTransfer");
const dataTransfer_1 = require("./dataTransfer");
class DataTransferUploadMultiViewerLabel extends dataTransferUploadBuffer_1.DataTransferUploadBuffer {
    constructor(sourceId, data) {
        super(data);
        _DataTransferUploadMultiViewerLabel_sourceId.set(this, void 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _DataTransferUploadMultiViewerLabel_sourceId, sourceId, "f");
    }
    async startTransfer(transferId) {
        const command = new DataTransfer_1.DataTransferUploadRequestCommand({
            transferId: transferId,
            transferStoreId: 0xffff,
            transferIndex: (0, tslib_1.__classPrivateFieldGet)(this, _DataTransferUploadMultiViewerLabel_sourceId, "f"),
            size: this.data.length,
            mode: 0x0201,
        });
        return {
            newState: dataTransfer_1.DataTransferState.Ready,
            commands: [command],
        };
    }
    generateDescriptionCommand(transferId) {
        return new DataTransfer_1.DataTransferFileDescriptionCommand({
            description: '',
            name: 'Label',
            fileHash: this.hash,
            transferId: transferId,
        });
    }
}
exports.default = DataTransferUploadMultiViewerLabel;
_DataTransferUploadMultiViewerLabel_sourceId = new WeakMap();
//# sourceMappingURL=dataTransferUploadMultiViewerLabel.js.map