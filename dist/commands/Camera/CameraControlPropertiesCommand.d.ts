/// <reference types="node" />
import { BasicWritableCommand } from '../CommandBase';
export interface CameraControlIrisProps {
    cameraId: number;
    percent: number;
}
export declare class CameraControlIrisCommand extends BasicWritableCommand<CameraControlIrisProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly percent: number;
    constructor(cameraId: number, percent: number);
    serialize(): Buffer;
}
export interface CameraControlGainLegacyProps {
    cameraId: number;
    value: number;
}
export declare class CameraControlGainLegacyCommand extends BasicWritableCommand<CameraControlGainLegacyProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly value: number;
    constructor(cameraId: number, value: number);
    serialize(): Buffer;
}
export interface CameraControlGainProps {
    cameraId: number;
    gainDb: number;
}
export declare class CameraControlGainCommand extends BasicWritableCommand<CameraControlGainProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly gainDb: number;
    constructor(cameraId: number, gainDb: number);
    serialize(): Buffer;
}
export interface CameraControlZoomProps {
    cameraId: number;
    speed: number;
}
export declare class CameraControlZoomCommand extends BasicWritableCommand<CameraControlZoomProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly speed: number;
    constructor(cameraId: number, speed: number);
    serialize(): Buffer;
}
export interface CameraControlPTZProps {
    cameraId: number;
    panSpeed: number;
    tiltSpeed: number;
}
export declare class CameraControlPTZCommand extends BasicWritableCommand<CameraControlPTZProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly panSpeed: number;
    readonly tiltSpeed: number;
    constructor(cameraId: number, panSpeed: number, tiltSpeed: number);
    serialize(): Buffer;
}
export interface CameraControlFocusProps {
    cameraId: number;
    increment: number;
}
export declare class CameraControlFocusCommand extends BasicWritableCommand<CameraControlFocusProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly increment: number;
    constructor(cameraId: number, increment: number);
    serialize(): Buffer;
}
export interface CameraControlAutoFocusProps {
    cameraId: number;
}
export declare class CameraControlAutoFocusCommand extends BasicWritableCommand<CameraControlAutoFocusProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    constructor(cameraId: number);
    serialize(): Buffer;
}
export interface CameraControlWhitebalanceProps {
    cameraId: number;
    kelvin: number;
}
export declare class CameraControlWhitebalanceCommand extends BasicWritableCommand<CameraControlWhitebalanceProps> {
    static readonly rawName = "CCmd";
    readonly cameraId: number;
    readonly kelvin: number;
    constructor(cameraId: number, kelvin: number);
    serialize(): Buffer;
}
export interface CameraControlUpdateProps {
    inputId: number;
    properties: LensAdjustmentProps;
}
export interface LensAdjustmentProps {
    focus: number;
    iris: number;
    autoIris: string;
    ZoomPosition: number;
    zoomSpeed: number;
}
//# sourceMappingURL=CameraControlPropertiesCommand.d.ts.map