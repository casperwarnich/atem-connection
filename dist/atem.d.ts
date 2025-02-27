/// <reference types="node" />
import { EventEmitter } from 'eventemitter3';
import { AtemState, ColorGeneratorState } from './state';
import { ISerializableCommand, IDeserializedCommand } from './commands/CommandBase';
import * as Commands from './commands';
import { MediaPlayer, MediaPlayerSource } from './state/media';
import { DipTransitionSettings, DVETransitionSettings, MixTransitionSettings, StingerTransitionSettings, SuperSource, TransitionProperties, WipeTransitionSettings } from './state/video';
import * as USK from './state/video/upstreamKeyers';
import { InputChannel } from './state/input';
import { DownstreamKeyerGeneral, DownstreamKeyerMask } from './state/video/downstreamKeyers';
import * as DT from './dataTransfer';
import * as Enums from './enums';
import { ClassicAudioMonitorChannel, ClassicAudioMasterChannel, ClassicAudioChannel, ClassicAudioHeadphoneOutputChannel } from './state/audio';
import { RecordingStateProperties } from './state/recording';
import { OmitReadonly } from './lib/types';
import { StreamingServiceProperties } from './state/streaming';
import { FairlightAudioMonitorChannel, FairlightAudioCompressorState, FairlightAudioLimiterState, FairlightAudioEqualizerBandState, FairlightAudioExpanderState } from './state/fairlight';
import { FairlightDynamicsResetProps } from './commands/Fairlight/common';
import { MultiViewerPropertiesState } from './state/settings';
import { FontFace } from '@julusian/freetype2';
import { TimeInfo } from './state/info';
export interface AtemOptions {
    address?: string;
    port?: number;
    debugBuffers?: boolean;
    disableMultithreaded?: boolean;
    childProcessTimeout?: number;
}
export declare type AtemEvents = {
    error: [string];
    info: [string];
    debug: [string];
    connected: [];
    disconnected: [];
    stateChanged: [AtemState, string[]];
    receivedCommands: [IDeserializedCommand[]];
    updatedTime: [TimeInfo];
};
export declare enum AtemConnectionStatus {
    CLOSED = 0,
    CONNECTING = 1,
    CONNECTED = 2
}
export declare const DEFAULT_PORT = 9910;
export declare class BasicAtem extends EventEmitter<AtemEvents> {
    private readonly socket;
    protected readonly dataTransferManager: DT.DataTransferManager;
    private _state;
    private _sentQueue;
    private _status;
    constructor(options?: AtemOptions);
    private _onInitComplete;
    get status(): AtemConnectionStatus;
    get state(): Readonly<AtemState> | undefined;
    connect(address: string, port?: number): Promise<void>;
    disconnect(): Promise<void>;
    destroy(): Promise<void>;
    private sendCommands;
    sendCommand(command: ISerializableCommand): Promise<void>;
    private _mutateState;
    private _resolveCommands;
    private _rejectAllCommands;
}
export declare class Atem extends BasicAtem {
    #private;
    constructor(options?: AtemOptions);
    /**
     * Set the font to use for the multiviewer, or reset to default
     */
    setMultiviewerFontFace(font: FontFace | string | null): Promise<void>;
    /**
     * Set the scale factor for the multiviewer text. Default is 1
     */
    setMultiviewerFontScale(scale: number | null): void;
    setIris(cameraId: number, percent: number): Promise<void>;
    setGain(cameraId: number, gainDb: 0 | 6 | 12 | 18): Promise<void>;
    setGainLegacy(cameraId: number, value: number): Promise<void>;
    setZoom(cameraId: number, speedNegative1ToPositive1: number): Promise<void>;
    setPTZ(cameraId: number, panSpeedNegative1ToPositive1: number, tiltSpeedNegative1ToPositive1: number): Promise<void>;
    setFocus(cameraId: number, incrementPercent: number): Promise<void>;
    setAutoFocus(cameraId: number): Promise<void>;
    setWhitebalance(cameraId: number, kelvin: number): Promise<void>;
    changeProgramInput(input: number, me?: number): Promise<void>;
    changePreviewInput(input: number, me?: number): Promise<void>;
    cut(me?: number): Promise<void>;
    autoTransition(me?: number): Promise<void>;
    fadeToBlack(me?: number): Promise<void>;
    setFadeToBlackRate(rate: number, me?: number): Promise<void>;
    autoDownstreamKey(key?: number, isTowardsOnAir?: boolean): Promise<void>;
    setDipTransitionSettings(newProps: Partial<DipTransitionSettings>, me?: number): Promise<void>;
    setDVETransitionSettings(newProps: Partial<DVETransitionSettings>, me?: number): Promise<void>;
    setMixTransitionSettings(newProps: Pick<MixTransitionSettings, 'rate'>, me?: number): Promise<void>;
    setTransitionPosition(position: number, me?: number): Promise<void>;
    previewTransition(on: boolean, me?: number): Promise<void>;
    setTransitionStyle(newProps: Partial<OmitReadonly<TransitionProperties>>, me?: number): Promise<void>;
    setStingerTransitionSettings(newProps: Partial<StingerTransitionSettings>, me?: number): Promise<void>;
    setWipeTransitionSettings(newProps: Partial<WipeTransitionSettings>, me?: number): Promise<void>;
    setAuxSource(source: number, bus?: number): Promise<void>;
    setDownstreamKeyTie(tie: boolean, key?: number): Promise<void>;
    setDownstreamKeyOnAir(onAir: boolean, key?: number): Promise<void>;
    setDownstreamKeyCutSource(input: number, key?: number): Promise<void>;
    setDownstreamKeyFillSource(input: number, key?: number): Promise<void>;
    setDownstreamKeyGeneralProperties(props: Partial<DownstreamKeyerGeneral>, key?: number): Promise<void>;
    setDownstreamKeyMaskSettings(props: Partial<DownstreamKeyerMask>, key?: number): Promise<void>;
    setDownstreamKeyRate(rate: number, key?: number): Promise<void>;
    setTime(hour: number, minute: number, second: number, frame: number): Promise<void>;
    requestTime(): Promise<void>;
    macroContinue(): Promise<void>;
    macroDelete(index?: number): Promise<void>;
    macroInsertUserWait(): Promise<void>;
    macroInsertTimedWait(frames: number): Promise<void>;
    macroRun(index?: number): Promise<void>;
    macroStop(): Promise<void>;
    macroStartRecord(index: number, name: string, description: string): Promise<void>;
    macroStopRecord(): Promise<void>;
    macroUpdateProperties(props: Commands.MacroPropertiesCommand['properties'], index?: number): Promise<void>;
    macroSetLoop(loop: boolean): Promise<void>;
    downloadMacro(index: number): Promise<Buffer>;
    uploadMacro(index: number, name: string, data: Buffer): Promise<void>;
    setMultiViewerWindowSource(source: number, mv?: number, window?: number): Promise<void>;
    setMultiViewerWindowSafeAreaEnabled(safeAreaEnabled: boolean, mv?: number, window?: number): Promise<void>;
    setMultiViewerWindowVuEnabled(vuEnabled: boolean, mv?: number, window?: number): Promise<void>;
    setMultiViewerVuOpacity(opacity: number, mv?: number): Promise<void>;
    setMultiViewerProperties(props: Partial<MultiViewerPropertiesState>, mv?: number): Promise<void>;
    setColorGeneratorColour(newProps: Partial<ColorGeneratorState>, index?: number): Promise<void>;
    setMediaPlayerSettings(newProps: Partial<MediaPlayer>, player?: number): Promise<void>;
    setMediaPlayerSource(newProps: Partial<MediaPlayerSource>, player?: number): Promise<void>;
    setMediaClip(index: number, name: string, frames?: number): Promise<void>;
    clearMediaPoolClip(clipId: number): Promise<void>;
    clearMediaPoolStill(stillId: number): Promise<void>;
    setSuperSourceBoxSettings(newProps: Partial<SuperSource.SuperSourceBox>, box?: number, ssrcId?: number): Promise<void>;
    setSuperSourceProperties(newProps: Partial<SuperSource.SuperSourceProperties>, ssrcId?: number): Promise<void>;
    setSuperSourceBorder(newProps: Partial<SuperSource.SuperSourceBorder>, ssrcId?: number): Promise<void>;
    setInputSettings(newProps: Partial<OmitReadonly<InputChannel>>, input?: number): Promise<void>;
    setUpstreamKeyerChromaSettings(newProps: Partial<USK.UpstreamKeyerChromaSettings>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerAdvancedChromaProperties(newProps: Partial<USK.UpstreamKeyerAdvancedChromaProperties>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerAdvancedChromaSample(newProps: Partial<USK.UpstreamKeyerAdvancedChromaSample>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerAdvancedChromaSampleReset(flags: Commands.AdvancedChromaSampleResetProps, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerCutSource(cutSource: number, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerFillSource(fillSource: number, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerDVESettings(newProps: Partial<USK.UpstreamKeyerDVESettings>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerLumaSettings(newProps: Partial<USK.UpstreamKeyerLumaSettings>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerMaskSettings(newProps: Partial<USK.UpstreamKeyerMaskSettings>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerPatternSettings(newProps: Partial<USK.UpstreamKeyerPatternSettings>, me?: number, keyer?: number): Promise<void>;
    setUpstreamKeyerOnAir(onAir: boolean, me?: number, keyer?: number): Promise<void>;
    runUpstreamKeyerFlyKeyTo(mixEffect: number, upstreamKeyerId: number, keyFrameId: Enums.FlyKeyKeyFrame.A | Enums.FlyKeyKeyFrame.B | Enums.FlyKeyKeyFrame.Full): Promise<void>;
    runUpstreamKeyerFlyKeyToInfinite(mixEffect: number, upstreamKeyerId: number, direction: Enums.FlyKeyDirection): Promise<void>;
    storeUpstreamKeyerFlyKeyKeyframe(mixEffect: number, upstreamKeyerId: number, keyframe: number): Promise<void>;
    setUpstreamKeyerFlyKeyKeyframe(mixEffect: number, upstreamKeyerId: number, keyframe: number, properties: Partial<Omit<USK.UpstreamKeyerFlyKeyframe, 'keyFrameId'>>): Promise<void>;
    setUpstreamKeyerType(newProps: Partial<USK.UpstreamKeyerTypeSettings>, me?: number, keyer?: number): Promise<void>;
    uploadStill(index: number, data: Buffer, name: string, description: string): Promise<void>;
    uploadClip(index: number, frames: Iterable<Buffer> | AsyncIterable<Buffer>, name: string): Promise<void>;
    uploadAudio(index: number, data: Buffer, name: string): Promise<void>;
    setClassicAudioMixerInputProps(index: number, props: Partial<OmitReadonly<ClassicAudioChannel>>): Promise<void>;
    setClassicAudioMixerMasterProps(props: Partial<ClassicAudioMasterChannel>): Promise<void>;
    setClassicAudioMixerMonitorProps(props: Partial<ClassicAudioMonitorChannel>): Promise<void>;
    setClassicAudioMixerHeadphonesProps(props: Partial<ClassicAudioHeadphoneOutputChannel>): Promise<void>;
    setClassicAudioResetPeaks(props: Partial<Commands.ClassicAudioResetPeaks>): Promise<void>;
    setClassicAudioMixerProps(props: Commands.AudioMixerPropertiesCommand['properties']): Promise<void>;
    setFairlightAudioMixerMasterProps(props: Partial<Commands.FairlightMixerMasterCommandProperties>): Promise<void>;
    setFairlightAudioMixerMasterCompressorProps(props: Partial<OmitReadonly<FairlightAudioCompressorState>>): Promise<void>;
    setFairlightAudioMixerMasterLimiterProps(props: Partial<OmitReadonly<FairlightAudioLimiterState>>): Promise<void>;
    setFairlightAudioMixerMasterEqualizerBandProps(band: number, props: Partial<OmitReadonly<FairlightAudioEqualizerBandState>>): Promise<void>;
    setFairlightAudioMixerMasterEqualizerReset(props: Partial<Commands.FairlightMixerMasterEqualizerResetCommand['properties']>): Promise<void>;
    setFairlightAudioMixerMasterDynamicsReset(props: Partial<FairlightDynamicsResetProps>): Promise<void>;
    setFairlightAudioMixerResetPeaks(props: Commands.FairlightMixerResetPeakLevelsCommand['properties']): Promise<void>;
    setFairlightAudioMixerMonitorProps(props: Partial<OmitReadonly<FairlightAudioMonitorChannel>>): Promise<void>;
    setFairlightAudioMixerInputProps(index: number, props: Commands.FairlightMixerInputCommand['properties']): Promise<void>;
    setFairlightAudioMixerSourceProps(index: number, source: string, props: Commands.FairlightMixerSourceCommand['properties']): Promise<void>;
    setFairlightAudioMixerSourceCompressorProps(index: number, source: string, props: Partial<OmitReadonly<FairlightAudioCompressorState>>): Promise<void>;
    setFairlightAudioMixerSourceLimiterProps(index: number, source: string, props: Partial<OmitReadonly<FairlightAudioLimiterState>>): Promise<void>;
    setFairlightAudioMixerSourceExpanderProps(index: number, source: string, props: Partial<OmitReadonly<FairlightAudioExpanderState>>): Promise<void>;
    setFairlightAudioMixerSourceEqualizerBandProps(index: number, source: string, band: number, props: Partial<OmitReadonly<FairlightAudioEqualizerBandState>>): Promise<void>;
    setFairlightAudioMixerSourceDynamicsReset(index: number, source: string, props: Partial<FairlightDynamicsResetProps>): Promise<void>;
    setFairlightAudioMixerSourceEqualizerReset(index: number, source: string, props: Partial<Commands.FairlightMixerSourceEqualizerResetCommand['properties']>): Promise<void>;
    setFairlightAudioMixerSourceResetPeaks(index: number, source: string, props: Commands.FairlightMixerSourceResetPeakLevelsCommand['properties']): Promise<void>;
    startStreaming(): Promise<void>;
    stopStreaming(): Promise<void>;
    requestStreamingDuration(): Promise<void>;
    setStreamingService(props: Partial<StreamingServiceProperties>): Promise<void>;
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
    requestRecordingDuration(): Promise<void>;
    switchRecordingDisk(): Promise<void>;
    setRecordingSettings(props: Partial<RecordingStateProperties>): Promise<void>;
    saveStartupState(): Promise<void>;
    clearStartupState(): Promise<void>;
    listVisibleInputs(mode: 'program' | 'preview', me?: number): number[];
    setMediaPoolSettings(props: Commands.MediaPoolProps): Promise<void>;
    hasInternalMultiviewerLabelGeneration(): boolean;
    /**
     * Write a custom multiviewer label buffer
     * @param inputId The input id
     * @param buffer Label buffer
     * @returns Promise that resolves once upload is complete
     */
    writeMultiviewerLabel(inputId: number, buffer: Buffer): Promise<void>;
    /**
     * Generate and upload a multiviewer label
     * @param inputId The input id
     * @param text Label text
     * @returns Promise that resolves once upload is complete
     */
    drawMultiviewerLabel(inputId: number, text: string): Promise<void>;
}
//# sourceMappingURL=atem.d.ts.map