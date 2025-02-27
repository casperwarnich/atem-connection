import { FairlightAudioMixOption, FairlightInputConfiguration, FairlightAnalogInputLevel, FairlightAudioSourceType, ExternalPortType, FairlightInputType } from '../enums';
export interface FairlightAudioDynamicsState {
    makeUpGain?: number;
    limiter?: FairlightAudioLimiterState;
    compressor?: FairlightAudioCompressorState;
    expander?: FairlightAudioExpanderState;
}
export interface FairlightAudioLimiterState {
    limiterEnabled: boolean;
    threshold: number;
    attack: number;
    hold: number;
    release: number;
}
export interface FairlightAudioCompressorState {
    compressorEnabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    hold: number;
    release: number;
}
export interface FairlightAudioExpanderState {
    expanderEnabled: boolean;
    gateEnabled: boolean;
    threshold: number;
    range: number;
    ratio: number;
    attack: number;
    hold: number;
    release: number;
}
export interface FairlightAudioEqualizerBandState {
    bandEnabled: boolean;
    readonly supportedShapes: number[];
    shape: number;
    readonly supportedFrequencyRanges: number[];
    frequencyRange: number;
    frequency: number;
    gain: number;
    qFactor: number;
}
export interface FairlightAudioMasterChannelPropertiesState {
    /** Gain in decibel, -Infinity to +6dB */
    faderGain: number;
    followFadeToBlack: boolean;
}
export interface FairlightAudioMasterChannel {
    properties?: FairlightAudioMasterChannelPropertiesState;
    equalizer?: FairlightAudioEqualizerState;
    dynamics?: Omit<FairlightAudioDynamicsState, 'expander'>;
}
export interface FairlightAudioMonitorChannel {
    gain: number;
    inputMasterGain: number;
    inputMasterMuted: boolean;
    inputTalkbackGain: number;
    inputSidetoneGain: number;
}
export interface FairlightAudioSource {
    properties?: FairlightAudioSourcePropertiesState;
    equalizer?: FairlightAudioEqualizerState;
    dynamics?: FairlightAudioDynamicsState;
}
export interface FairlightAudioEqualizerState {
    enabled: boolean;
    gain: number;
    readonly bands: Array<FairlightAudioEqualizerBandState | undefined>;
}
export interface FairlightAudioSourcePropertiesState {
    readonly sourceType: FairlightAudioSourceType;
    readonly maxFramesDelay: number;
    framesDelay: number;
    readonly hasStereoSimulation: boolean;
    stereoSimulation: number;
    gain: number;
    balance: number;
    faderGain: number;
    readonly supportedMixOptions: FairlightAudioMixOption[];
    mixOption: FairlightAudioMixOption;
}
export interface FairlightAudioInput {
    properties?: FairlightAudioInputProperties;
    sources: {
        [sourceId: string]: FairlightAudioSource | undefined;
    };
}
export interface FairlightAudioInputProperties {
    readonly inputType: FairlightInputType;
    readonly externalPortType: ExternalPortType;
    readonly supportedConfigurations: FairlightInputConfiguration[];
    activeConfiguration: FairlightInputConfiguration;
    readonly supportedInputLevels: FairlightAnalogInputLevel[];
    activeInputLevel: FairlightAnalogInputLevel;
}
export interface AtemFairlightAudioState {
    inputs: {
        [input: number]: FairlightAudioInput | undefined;
    };
    master?: FairlightAudioMasterChannel;
    monitor?: FairlightAudioMonitorChannel;
    audioFollowVideoCrossfadeTransitionEnabled?: boolean;
}
//# sourceMappingURL=fairlight.d.ts.map