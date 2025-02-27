"use strict";
var _Atem_multiviewerFontFace, _Atem_multiviewerFontScale;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atem = exports.BasicAtem = exports.DEFAULT_PORT = exports.AtemConnectionStatus = void 0;
const tslib_1 = require("tslib");
const eventemitter3_1 = require("eventemitter3");
const state_1 = require("./state");
const atemSocket_1 = require("./lib/atemSocket");
const Commands = require("./commands");
const DataTransferCommands = require("./commands/DataTransfer");
const DT = require("./dataTransfer");
const Util = require("./lib/atemUtil");
const Enums = require("./enums");
const tally_1 = require("./lib/tally");
const multiviewLabel_1 = require("./lib/multiviewLabel");
const PLazy = require("p-lazy");
const commands_1 = require("./commands");
var AtemConnectionStatus;
(function (AtemConnectionStatus) {
    AtemConnectionStatus[AtemConnectionStatus["CLOSED"] = 0] = "CLOSED";
    AtemConnectionStatus[AtemConnectionStatus["CONNECTING"] = 1] = "CONNECTING";
    AtemConnectionStatus[AtemConnectionStatus["CONNECTED"] = 2] = "CONNECTED";
})(AtemConnectionStatus = exports.AtemConnectionStatus || (exports.AtemConnectionStatus = {}));
exports.DEFAULT_PORT = 9910;
class BasicAtem extends eventemitter3_1.EventEmitter {
    constructor(options) {
        super();
        this._sentQueue = {};
        this._state = state_1.AtemStateUtil.Create();
        this._status = AtemConnectionStatus.CLOSED;
        this.socket = new atemSocket_1.AtemSocket({
            debugBuffers: (options || {}).debugBuffers || false,
            address: (options || {}).address || '',
            port: (options || {}).port || exports.DEFAULT_PORT,
            disableMultithreaded: (options || {}).disableMultithreaded || false,
            childProcessTimeout: (options || {}).childProcessTimeout || 600,
        });
        this.dataTransferManager = new DT.DataTransferManager(this.sendCommands.bind(this));
        this.socket.on('commandsReceived', (commands) => {
            this.emit('receivedCommands', commands);
            this._mutateState(commands);
        });
        this.socket.on('commandsAck', (trackingIds) => this._resolveCommands(trackingIds));
        this.socket.on('info', (msg) => this.emit('info', msg));
        this.socket.on('debug', (msg) => this.emit('debug', msg));
        this.socket.on('error', (e) => this.emit('error', e));
        this.socket.on('disconnect', () => {
            this._status = AtemConnectionStatus.CLOSED;
            this.dataTransferManager.stopCommandSending();
            this._rejectAllCommands();
            this.emit('disconnected');
            this._state = undefined;
        });
    }
    _onInitComplete() {
        this.dataTransferManager.startCommandSending();
        this.emit('connected');
    }
    get status() {
        return this._status;
    }
    get state() {
        return this._state;
    }
    async connect(address, port) {
        return this.socket.connect(address, port);
    }
    async disconnect() {
        return this.socket.disconnect();
    }
    async destroy() {
        this.dataTransferManager.stopCommandSending();
        return this.socket.destroy();
    }
    sendCommands(commands) {
        const commands2 = commands.map((cmd) => ({
            rawCommand: cmd,
            trackingId: this.socket.nextCommandTrackingId,
        }));
        const sendPromise = this.socket.sendCommands(commands2);
        return commands2.map(async (cmd) => {
            await sendPromise;
            return new Promise((resolve, reject) => {
                this._sentQueue[cmd.trackingId] = {
                    command: cmd.rawCommand,
                    resolve,
                    reject,
                };
            });
        });
    }
    async sendCommand(command) {
        return this.sendCommands([command])[0];
    }
    _mutateState(commands) {
        // Is this the start of a new connection?
        if (commands.find((cmd) => cmd.constructor.name === Commands.VersionCommand.name)) {
            // On start of connection, create a new state object
            this._state = state_1.AtemStateUtil.Create();
            this._status = AtemConnectionStatus.CONNECTING;
        }
        const allChangedPaths = [];
        const state = this._state;
        for (const command of commands) {
            if (command instanceof commands_1.TimeCommand) {
                this.emit('updatedTime', command.properties);
            }
            else if (state) {
                try {
                    const changePaths = command.applyToState(state);
                    if (!Array.isArray(changePaths)) {
                        allChangedPaths.push(changePaths);
                    }
                    else {
                        allChangedPaths.push(...changePaths);
                    }
                }
                catch (e) {
                    if (e instanceof state_1.InvalidIdError) {
                        this.emit('debug', `Invalid command id: ${e}. Command: ${command.constructor.name} ${Util.commandStringify(command)}`);
                    }
                    else {
                        this.emit('error', `MutateState failed: ${e}. Command: ${command.constructor.name} ${Util.commandStringify(command)}`);
                    }
                }
            }
            for (const commandName in DataTransferCommands) {
                // TODO - this is fragile
                if (command.constructor.name === commandName) {
                    this.dataTransferManager.queueHandleCommand(command);
                }
            }
        }
        const initComplete = commands.find((cmd) => cmd.constructor.name === Commands.InitCompleteCommand.name);
        if (initComplete) {
            this._status = AtemConnectionStatus.CONNECTED;
            this._onInitComplete();
        }
        else if (state && this._status === AtemConnectionStatus.CONNECTED && allChangedPaths.length > 0) {
            this.emit('stateChanged', state, allChangedPaths);
        }
    }
    _resolveCommands(trackingIds) {
        trackingIds.forEach((trackingId) => {
            const sent = this._sentQueue[trackingId];
            if (sent) {
                sent.resolve();
                delete this._sentQueue[trackingId];
            }
        });
    }
    _rejectAllCommands() {
        // Take a copy in case the promises cause more mutations
        const sentQueue = this._sentQueue;
        this._sentQueue = {};
        Object.values(sentQueue).forEach((sent) => sent.reject());
    }
}
exports.BasicAtem = BasicAtem;
class Atem extends BasicAtem {
    constructor(options) {
        super(options);
        _Atem_multiviewerFontFace.set(this, void 0);
        _Atem_multiviewerFontScale.set(this, void 0);
        (0, tslib_1.__classPrivateFieldSet)(this, _Atem_multiviewerFontFace, PLazy.from(async () => (0, multiviewLabel_1.loadFont)()), "f");
        (0, tslib_1.__classPrivateFieldSet)(this, _Atem_multiviewerFontScale, 1.0, "f");
    }
    /**
     * Set the font to use for the multiviewer, or reset to default
     */
    async setMultiviewerFontFace(font) {
        let loadedFont;
        if (font) {
            if (typeof font === 'string') {
                loadedFont = await (0, multiviewLabel_1.loadFont)(font);
            }
            else {
                loadedFont = font;
            }
        }
        else {
            loadedFont = await (0, multiviewLabel_1.loadFont)();
        }
        (0, tslib_1.__classPrivateFieldSet)(this, _Atem_multiviewerFontFace, Promise.resolve(loadedFont), "f");
    }
    /**
     * Set the scale factor for the multiviewer text. Default is 1
     */
    setMultiviewerFontScale(scale) {
        if (typeof scale === 'number') {
            if (scale <= 0)
                throw new Error('Scale must be greater than 0');
            (0, tslib_1.__classPrivateFieldSet)(this, _Atem_multiviewerFontScale, scale, "f");
        }
        else if (scale === null) {
            (0, tslib_1.__classPrivateFieldSet)(this, _Atem_multiviewerFontScale, 1.0, "f");
        }
    }
    // Cameracontrol:
    setIris(cameraId, percent) {
        const command = new Commands.CameraControlIrisCommand(cameraId, percent);
        return this.sendCommand(command);
    }
    setGain(cameraId, gainDb) {
        const command = new Commands.CameraControlGainCommand(cameraId, gainDb);
        //Fallback to legacy gain:
        switch (gainDb) {
            case 0:
                this.setGainLegacy(cameraId, 2);
                break;
            case 6:
                this.setGainLegacy(cameraId, 4);
                break;
            case 12:
                this.setGainLegacy(cameraId, 8);
                break;
            case 18:
                this.setGainLegacy(cameraId, 10);
                break;
            default:
                break;
        }
        return this.sendCommand(command);
    }
    setGainLegacy(cameraId, value) {
        const command = new Commands.CameraControlGainLegacyCommand(cameraId, value);
        return this.sendCommand(command);
    }
    setZoom(cameraId, speedNegative1ToPositive1) {
        const command = new Commands.CameraControlZoomCommand(cameraId, speedNegative1ToPositive1);
        return this.sendCommand(command);
    }
    setPTZ(cameraId, panSpeedNegative1ToPositive1, tiltSpeedNegative1ToPositive1) {
        const command = new Commands.CameraControlPTZCommand(cameraId, panSpeedNegative1ToPositive1, tiltSpeedNegative1ToPositive1);
        return this.sendCommand(command);
    }
    setFocus(cameraId, incrementPercent) {
        const command = new Commands.CameraControlFocusCommand(cameraId, incrementPercent);
        return this.sendCommand(command);
    }
    setAutoFocus(cameraId) {
        const command = new Commands.CameraControlAutoFocusCommand(cameraId);
        return this.sendCommand(command);
    }
    setWhitebalance(cameraId, kelvin) {
        const command = new Commands.CameraControlWhitebalanceCommand(cameraId, kelvin);
        return this.sendCommand(command);
    }
    //
    async changeProgramInput(input, me = 0) {
        const command = new Commands.ProgramInputCommand(me, input);
        return this.sendCommand(command);
    }
    async changePreviewInput(input, me = 0) {
        const command = new Commands.PreviewInputCommand(me, input);
        return this.sendCommand(command);
    }
    async cut(me = 0) {
        const command = new Commands.CutCommand(me);
        return this.sendCommand(command);
    }
    async autoTransition(me = 0) {
        const command = new Commands.AutoTransitionCommand(me);
        return this.sendCommand(command);
    }
    async fadeToBlack(me = 0) {
        const command = new Commands.FadeToBlackAutoCommand(me);
        return this.sendCommand(command);
    }
    async setFadeToBlackRate(rate, me = 0) {
        const command = new Commands.FadeToBlackRateCommand(me, rate);
        return this.sendCommand(command);
    }
    async autoDownstreamKey(key = 0, isTowardsOnAir) {
        const command = new Commands.DownstreamKeyAutoCommand(key);
        command.updateProps({ isTowardsOnAir });
        return this.sendCommand(command);
    }
    async setDipTransitionSettings(newProps, me = 0) {
        const command = new Commands.TransitionDipCommand(me);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setDVETransitionSettings(newProps, me = 0) {
        const command = new Commands.TransitionDVECommand(me);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setMixTransitionSettings(newProps, me = 0) {
        const command = new Commands.TransitionMixCommand(me, newProps.rate);
        return this.sendCommand(command);
    }
    async setTransitionPosition(position, me = 0) {
        const command = new Commands.TransitionPositionCommand(me, position);
        return this.sendCommand(command);
    }
    async previewTransition(on, me = 0) {
        const command = new Commands.PreviewTransitionCommand(me, on);
        return this.sendCommand(command);
    }
    async setTransitionStyle(newProps, me = 0) {
        const command = new Commands.TransitionPropertiesCommand(me);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setStingerTransitionSettings(newProps, me = 0) {
        const command = new Commands.TransitionStingerCommand(me);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setWipeTransitionSettings(newProps, me = 0) {
        const command = new Commands.TransitionWipeCommand(me);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setAuxSource(source, bus = 0) {
        const command = new Commands.AuxSourceCommand(bus, source);
        return this.sendCommand(command);
    }
    async setDownstreamKeyTie(tie, key = 0) {
        const command = new Commands.DownstreamKeyTieCommand(key, tie);
        return this.sendCommand(command);
    }
    async setDownstreamKeyOnAir(onAir, key = 0) {
        const command = new Commands.DownstreamKeyOnAirCommand(key, onAir);
        return this.sendCommand(command);
    }
    async setDownstreamKeyCutSource(input, key = 0) {
        const command = new Commands.DownstreamKeyCutSourceCommand(key, input);
        return this.sendCommand(command);
    }
    async setDownstreamKeyFillSource(input, key = 0) {
        const command = new Commands.DownstreamKeyFillSourceCommand(key, input);
        return this.sendCommand(command);
    }
    async setDownstreamKeyGeneralProperties(props, key = 0) {
        const command = new Commands.DownstreamKeyGeneralCommand(key);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setDownstreamKeyMaskSettings(props, key = 0) {
        const command = new Commands.DownstreamKeyMaskCommand(key);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setDownstreamKeyRate(rate, key = 0) {
        const command = new Commands.DownstreamKeyRateCommand(key, rate);
        return this.sendCommand(command);
    }
    async setTime(hour, minute, second, frame) {
        const command = new Commands.TimeCommand({ hour, minute, second, frame });
        return this.sendCommand(command);
    }
    async requestTime() {
        const command = new Commands.TimeRequestCommand();
        return this.sendCommand(command);
    }
    async macroContinue() {
        const command = new Commands.MacroActionCommand(0, Enums.MacroAction.Continue);
        return this.sendCommand(command);
    }
    async macroDelete(index = 0) {
        const command = new Commands.MacroActionCommand(index, Enums.MacroAction.Delete);
        return this.sendCommand(command);
    }
    async macroInsertUserWait() {
        const command = new Commands.MacroActionCommand(0, Enums.MacroAction.InsertUserWait);
        return this.sendCommand(command);
    }
    async macroInsertTimedWait(frames) {
        const command = new Commands.MacroAddTimedPauseCommand(frames);
        return this.sendCommand(command);
    }
    async macroRun(index = 0) {
        const command = new Commands.MacroActionCommand(index, Enums.MacroAction.Run);
        return this.sendCommand(command);
    }
    async macroStop() {
        const command = new Commands.MacroActionCommand(0, Enums.MacroAction.Stop);
        return this.sendCommand(command);
    }
    async macroStartRecord(index, name, description) {
        const command = new Commands.MacroRecordCommand(index, name, description);
        return this.sendCommand(command);
    }
    async macroStopRecord() {
        const command = new Commands.MacroActionCommand(0, Enums.MacroAction.StopRecord);
        return this.sendCommand(command);
    }
    async macroUpdateProperties(props, index = 0) {
        const command = new Commands.MacroPropertiesCommand(index);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async macroSetLoop(loop) {
        const command = new Commands.MacroRunStatusCommand();
        command.updateProps({ loop });
        return this.sendCommand(command);
    }
    async downloadMacro(index) {
        return this.dataTransferManager.downloadMacro(index);
    }
    async uploadMacro(index, name, data) {
        return this.dataTransferManager.uploadMacro(index, data, name);
    }
    async setMultiViewerWindowSource(source, mv = 0, window = 0) {
        const command = new Commands.MultiViewerSourceCommand(mv, window, source);
        return this.sendCommand(command);
    }
    async setMultiViewerWindowSafeAreaEnabled(safeAreaEnabled, mv = 0, window = 0) {
        const command = new Commands.MultiViewerWindowSafeAreaCommand(mv, window, safeAreaEnabled);
        return this.sendCommand(command);
    }
    async setMultiViewerWindowVuEnabled(vuEnabled, mv = 0, window = 0) {
        const command = new Commands.MultiViewerWindowVuMeterCommand(mv, window, vuEnabled);
        return this.sendCommand(command);
    }
    async setMultiViewerVuOpacity(opacity, mv = 0) {
        const command = new Commands.MultiViewerVuOpacityCommand(mv, opacity);
        return this.sendCommand(command);
    }
    async setMultiViewerProperties(props, mv = 0) {
        const command = new Commands.MultiViewerPropertiesCommand(mv);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setColorGeneratorColour(newProps, index = 0) {
        const command = new Commands.ColorGeneratorCommand(index);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setMediaPlayerSettings(newProps, player = 0) {
        const command = new Commands.MediaPlayerStatusCommand(player);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setMediaPlayerSource(newProps, player = 0) {
        const command = new Commands.MediaPlayerSourceCommand(player);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setMediaClip(index, name, frames = 1) {
        const command = new Commands.MediaPoolSetClipCommand({ index, name, frames });
        return this.sendCommand(command);
    }
    async clearMediaPoolClip(clipId) {
        const command = new Commands.MediaPoolClearClipCommand(clipId);
        return this.sendCommand(command);
    }
    async clearMediaPoolStill(stillId) {
        const command = new Commands.MediaPoolClearStillCommand(stillId);
        return this.sendCommand(command);
    }
    async setSuperSourceBoxSettings(newProps, box = 0, ssrcId = 0) {
        const command = new Commands.SuperSourceBoxParametersCommand(ssrcId, box);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setSuperSourceProperties(newProps, ssrcId = 0) {
        if (this.state && this.state.info.apiVersion >= Enums.ProtocolVersion.V8_0) {
            const command = new Commands.SuperSourcePropertiesV8Command(ssrcId);
            command.updateProps(newProps);
            return this.sendCommand(command);
        }
        else {
            const command = new Commands.SuperSourcePropertiesCommand();
            command.updateProps(newProps);
            return this.sendCommand(command);
        }
    }
    async setSuperSourceBorder(newProps, ssrcId = 0) {
        if (this.state && this.state.info.apiVersion >= Enums.ProtocolVersion.V8_0) {
            const command = new Commands.SuperSourceBorderCommand(ssrcId);
            command.updateProps(newProps);
            return this.sendCommand(command);
        }
        else {
            const command = new Commands.SuperSourcePropertiesCommand();
            command.updateProps(newProps);
            return this.sendCommand(command);
        }
    }
    async setInputSettings(newProps, input = 0) {
        const command = new Commands.InputPropertiesCommand(input);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerChromaSettings(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyChromaCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerAdvancedChromaProperties(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyAdvancedChromaPropertiesCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerAdvancedChromaSample(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyAdvancedChromaSampleCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerAdvancedChromaSampleReset(flags, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyAdvancedChromaSampleResetCommand(me, keyer, flags);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerCutSource(cutSource, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyCutSourceSetCommand(me, keyer, cutSource);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerFillSource(fillSource, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyFillSourceSetCommand(me, keyer, fillSource);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerDVESettings(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyDVECommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerLumaSettings(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyLumaCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerMaskSettings(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyMaskSetCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerPatternSettings(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyPatternCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerOnAir(onAir, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyOnAirCommand(me, keyer, onAir);
        return this.sendCommand(command);
    }
    async runUpstreamKeyerFlyKeyTo(mixEffect, upstreamKeyerId, keyFrameId) {
        const command = new Commands.MixEffectKeyRunToCommand(mixEffect, upstreamKeyerId, keyFrameId, 0);
        return this.sendCommand(command);
    }
    async runUpstreamKeyerFlyKeyToInfinite(mixEffect, upstreamKeyerId, direction) {
        const command = new Commands.MixEffectKeyRunToCommand(mixEffect, upstreamKeyerId, Enums.FlyKeyKeyFrame.RunToInfinite, direction);
        return this.sendCommand(command);
    }
    async storeUpstreamKeyerFlyKeyKeyframe(mixEffect, upstreamKeyerId, keyframe) {
        const command = new Commands.MixEffectKeyFlyKeyframeStoreCommand(mixEffect, upstreamKeyerId, keyframe);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerFlyKeyKeyframe(mixEffect, upstreamKeyerId, keyframe, properties) {
        const command = new Commands.MixEffectKeyFlyKeyframeCommand(mixEffect, upstreamKeyerId, keyframe);
        command.updateProps(properties);
        return this.sendCommand(command);
    }
    async setUpstreamKeyerType(newProps, me = 0, keyer = 0) {
        const command = new Commands.MixEffectKeyTypeSetCommand(me, keyer);
        command.updateProps(newProps);
        return this.sendCommand(command);
    }
    async uploadStill(index, data, name, description) {
        if (!this.state)
            return Promise.reject();
        const resolution = Util.getVideoModeInfo(this.state.settings.videoMode);
        if (!resolution)
            return Promise.reject();
        return this.dataTransferManager.uploadStill(index, Util.convertRGBAToYUV422(resolution.width, resolution.height, data), name, description);
    }
    async uploadClip(index, frames, name) {
        if (!this.state)
            return Promise.reject();
        const resolution = Util.getVideoModeInfo(this.state.settings.videoMode);
        if (!resolution)
            return Promise.reject();
        const provideFrame = async function* () {
            for await (const frame of frames) {
                yield Util.convertRGBAToYUV422(resolution.width, resolution.height, frame);
            }
        };
        return this.dataTransferManager.uploadClip(index, provideFrame(), name);
    }
    async uploadAudio(index, data, name) {
        return this.dataTransferManager.uploadAudio(index, Util.convertWAVToRaw(data, this.state?.info?.model), name);
    }
    async setClassicAudioMixerInputProps(index, props) {
        const command = new Commands.AudioMixerInputCommand(index);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setClassicAudioMixerMasterProps(props) {
        const command = new Commands.AudioMixerMasterCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setClassicAudioMixerMonitorProps(props) {
        const command = new Commands.AudioMixerMonitorCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setClassicAudioMixerHeadphonesProps(props) {
        const command = new Commands.AudioMixerHeadphonesCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setClassicAudioResetPeaks(props) {
        const command = new Commands.AudioMixerResetPeaksCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setClassicAudioMixerProps(props) {
        const command = new Commands.AudioMixerPropertiesCommand(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterProps(props) {
        const command = new Commands.FairlightMixerMasterCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterCompressorProps(props) {
        const command = new Commands.FairlightMixerMasterCompressorCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterLimiterProps(props) {
        const command = new Commands.FairlightMixerMasterLimiterCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterEqualizerBandProps(band, props) {
        const command = new Commands.FairlightMixerMasterEqualizerBandCommand(band);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterEqualizerReset(props) {
        const command = new Commands.FairlightMixerMasterEqualizerResetCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMasterDynamicsReset(props) {
        const command = new Commands.FairlightMixerMasterDynamicsResetCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerResetPeaks(props) {
        const command = new Commands.FairlightMixerResetPeakLevelsCommand(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerMonitorProps(props) {
        const command = new Commands.FairlightMixerMonitorCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerInputProps(index, props) {
        if (this.state && this.state.info.apiVersion >= Enums.ProtocolVersion.V8_0) {
            const command = new Commands.FairlightMixerInputV8Command(index);
            command.updateProps(props);
            return this.sendCommand(command);
        }
        else {
            const command = new Commands.FairlightMixerInputCommand(index);
            command.updateProps(props);
            return this.sendCommand(command);
        }
    }
    async setFairlightAudioMixerSourceProps(index, source, props) {
        const command = new Commands.FairlightMixerSourceCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceCompressorProps(index, source, props) {
        const command = new Commands.FairlightMixerSourceCompressorCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceLimiterProps(index, source, props) {
        const command = new Commands.FairlightMixerSourceLimiterCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceExpanderProps(index, source, props) {
        const command = new Commands.FairlightMixerSourceExpanderCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceEqualizerBandProps(index, source, band, props) {
        const command = new Commands.FairlightMixerSourceEqualizerBandCommand(index, BigInt(source), band);
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceDynamicsReset(index, source, props) {
        const command = new Commands.FairlightMixerSourceDynamicsResetCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceEqualizerReset(index, source, props) {
        const command = new Commands.FairlightMixerSourceEqualizerResetCommand(index, BigInt(source));
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async setFairlightAudioMixerSourceResetPeaks(index, source, props) {
        const command = new Commands.FairlightMixerSourceResetPeakLevelsCommand(index, BigInt(source), props);
        return this.sendCommand(command);
    }
    async startStreaming() {
        const command = new Commands.StreamingStatusCommand(true);
        return this.sendCommand(command);
    }
    async stopStreaming() {
        const command = new Commands.StreamingStatusCommand(false);
        return this.sendCommand(command);
    }
    async requestStreamingDuration() {
        const command = new Commands.StreamingRequestDurationCommand();
        return this.sendCommand(command);
    }
    async setStreamingService(props) {
        const command = new Commands.StreamingServiceCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async startRecording() {
        const command = new Commands.RecordingStatusCommand(true);
        return this.sendCommand(command);
    }
    async stopRecording() {
        const command = new Commands.RecordingStatusCommand(false);
        return this.sendCommand(command);
    }
    async requestRecordingDuration() {
        const command = new Commands.RecordingRequestDurationCommand();
        return this.sendCommand(command);
    }
    async switchRecordingDisk() {
        const command = new Commands.RecordingRequestSwitchDiskCommand();
        return this.sendCommand(command);
    }
    async setRecordingSettings(props) {
        const command = new Commands.RecordingSettingsCommand();
        command.updateProps(props);
        return this.sendCommand(command);
    }
    async saveStartupState() {
        const command = new Commands.StartupStateSaveCommand();
        return this.sendCommand(command);
    }
    async clearStartupState() {
        const command = new Commands.StartupStateClearCommand();
        return this.sendCommand(command);
    }
    listVisibleInputs(mode, me = 0) {
        if (this.state) {
            return (0, tally_1.listVisibleInputs)(mode, this.state, me);
        }
        else {
            return [];
        }
    }
    async setMediaPoolSettings(props) {
        const command = new Commands.MediaPoolSettingsSetCommand(props.maxFrames);
        return this.sendCommand(command);
    }
    hasInternalMultiviewerLabelGeneration() {
        return !!this.state && (0, multiviewLabel_1.hasInternalMultiviewerLabelGeneration)(this.state?.info.model);
    }
    /**
     * Write a custom multiviewer label buffer
     * @param inputId The input id
     * @param buffer Label buffer
     * @returns Promise that resolves once upload is complete
     */
    async writeMultiviewerLabel(inputId, buffer) {
        if (this.hasInternalMultiviewerLabelGeneration())
            throw new Error(`ATEM doesn't support custom labels`);
        // Verify the buffer doesnt contain data that is 'out of bounds' and will crash the atem
        const badValues = new Set([255, 254]);
        for (const val of buffer) {
            if (badValues.has(val)) {
                throw new Error(`Buffer contains invalid value ${val}`);
            }
        }
        return this.dataTransferManager.uploadMultiViewerLabel(inputId, buffer);
    }
    /**
     * Generate and upload a multiviewer label
     * @param inputId The input id
     * @param text Label text
     * @returns Promise that resolves once upload is complete
     */
    async drawMultiviewerLabel(inputId, text) {
        if (this.hasInternalMultiviewerLabelGeneration())
            throw new Error(`ATEM doesn't support custom labels`);
        const props = (0, multiviewLabel_1.calculateGenerateMultiviewerLabelProps)(this.state ?? null);
        if (!props)
            throw new Error(`Failed to determine render properties`);
        const fontFace = await (0, tslib_1.__classPrivateFieldGet)(this, _Atem_multiviewerFontFace, "f");
        const buffer = (0, multiviewLabel_1.generateMultiviewerLabel)(fontFace, (0, tslib_1.__classPrivateFieldGet)(this, _Atem_multiviewerFontScale, "f"), text, props);
        // Note: we should probably validate the buffer looks like it doesn't contain crashy data, but as we generate we can trust it
        return this.dataTransferManager.uploadMultiViewerLabel(inputId, buffer);
    }
}
exports.Atem = Atem;
_Atem_multiviewerFontFace = new WeakMap(), _Atem_multiviewerFontScale = new WeakMap();
//# sourceMappingURL=atem.js.map