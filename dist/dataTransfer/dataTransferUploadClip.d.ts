/// <reference types="node" />
import { IDeserializedCommand, ISerializableCommand } from '../commands/CommandBase';
import { DataTransfer, DataTransferState, ProgressTransferResult } from './dataTransfer';
import { DataTransferUploadBuffer } from './dataTransferUploadBuffer';
export declare type DataTransferFrameGenerator = Generator<DataTransferUploadClipFrame, undefined> | AsyncGenerator<DataTransferUploadClipFrame, undefined>;
export declare class DataTransferUploadClip extends DataTransfer<void> {
    #private;
    constructor(clipIndex: number, name: string, frames: DataTransferFrameGenerator, nextTransferId: () => number);
    private nextFrame;
    startTransfer(transferId: number): Promise<ProgressTransferResult>;
    /** Restart the current transfer */
    restartTransfer(transferId: number): Promise<ProgressTransferResult>;
    handleCommand(command: IDeserializedCommand, oldState: DataTransferState): Promise<ProgressTransferResult>;
}
export declare class DataTransferUploadClipFrame extends DataTransferUploadBuffer {
    #private;
    constructor(clipIndex: number, frameIndex: number, data: Buffer);
    startTransfer(transferId: number): Promise<ProgressTransferResult>;
    protected generateDescriptionCommand(transferId: number): ISerializableCommand;
}
//# sourceMappingURL=dataTransferUploadClip.d.ts.map