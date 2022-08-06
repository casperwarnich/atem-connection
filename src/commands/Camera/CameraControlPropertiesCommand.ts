import { BasicWritableCommand } from '../CommandBase'

export interface CameraControlIrisProps {
	cameraId: number
	percent: number
}

export class CameraControlIrisCommand extends BasicWritableCommand<CameraControlIrisProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly percent: number

	constructor(cameraId: number, percent: number) {
		super({ cameraId, percent })
		this.cameraId = cameraId
		this.percent = percent
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(0, 1) //Domain
		buffer.writeUInt8(2, 2) //Feature
		buffer.writeUInt8(128, 4) //Relative
		buffer.writeUInt8(1, 9) //?
		let rawvalue = -(((this.percent - 140) / 100) * 15360 + 3072) // between 0 and 100;
		buffer.writeInt16BE(rawvalue, 16) //Value
		return buffer
	}
}

////////////////////////////////////////

export interface CameraControlGainLegacyProps {
	cameraId: number
	value: number // 2 == 0db, 4 == 6db, 8 == 12db, 10 == 18db
}

export class CameraControlGainLegacyCommand extends BasicWritableCommand<CameraControlGainLegacyProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly value: number

	constructor(cameraId: number, value: number) {
		super({ cameraId, value })
		this.cameraId = cameraId
		this.value = value
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(1, 1) //Domain
		buffer.writeUInt8(1, 2) //Feature
		buffer.writeUInt8(0, 3) //Relative
		buffer.writeUInt8(1, 4) //?
		buffer.writeUInt8(1, 7) //?
		buffer.writeInt8(8, 16) //Value
		return buffer
	}
}

/////////////////////////////////

export interface CameraControlGainProps {
	cameraId: number
	gainDb: number
}

export class CameraControlGainCommand extends BasicWritableCommand<CameraControlGainProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly gainDb: number

	constructor(cameraId: number, gainDb: number) {
		super({ cameraId, gainDb })
		this.cameraId = cameraId
		this.gainDb = gainDb
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(1, 1) //Domain
		buffer.writeUInt8(13, 2) //Feature
		buffer.writeUInt8(1, 4) //Relative
		buffer.writeUInt8(1, 7) //?
		buffer.writeInt8(this.gainDb, 16) //Value
		return buffer
	}
}

////////////////////////////////////////

export interface CameraControlZoomProps {
	cameraId: number
	speed: number
}

export class CameraControlZoomCommand extends BasicWritableCommand<CameraControlZoomProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly speed: number

	constructor(cameraId: number, speed: number) {
		super({ cameraId, speed })
		this.cameraId = cameraId
		this.speed = speed
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		//Zoom, virker
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(0, 1) //Domain
		buffer.writeUInt8(9, 2) //Feature
		buffer.writeUInt8(128, 4) //Relative
		buffer.writeUInt8(1, 9) //?
		buffer.writeInt16BE(this.speed * 2048, 16) //Value
		return buffer
	}
}

////////////////////////////////

export interface CameraControlPTZProps {
	cameraId: number
	panSpeed: number
	tiltSpeed: number
}

export class CameraControlPTZCommand extends BasicWritableCommand<CameraControlPTZProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly panSpeed: number
	readonly tiltSpeed: number

	constructor(cameraId: number, panSpeed: number, tiltSpeed: number) {
		super({ cameraId, panSpeed, tiltSpeed })
		this.cameraId = cameraId
		this.panSpeed = panSpeed
		this.tiltSpeed = tiltSpeed
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		//PTZ, virker
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(11, 1) //Domain
		buffer.writeUInt8(0, 2) //Feature
		buffer.writeUInt8(128, 4) //Relative
		buffer.writeUInt8(2, 9) //?
		buffer.writeUInt8(80, 14) //?
		buffer.writeInt16BE(this.panSpeed * 2048, 16) //Pan -2048 til 2048 - Plus er højre
		buffer.writeInt16BE(this.tiltSpeed * 2048, 18) //Tilt -2048 til 2048 - Plus er op
		return buffer
	}
}

////////////////////////////////////

export interface CameraControlFocusProps {
	cameraId: number
	increment: number
}

export class CameraControlFocusCommand extends BasicWritableCommand<CameraControlFocusProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly increment: number

	constructor(cameraId: number, increment: number) {
		super({ cameraId, increment })
		this.cameraId = cameraId
		this.increment = increment
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		//Fokus, virker
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(0, 1) //Domain
		buffer.writeUInt8(0, 2) //Feature
		buffer.writeUInt8(1, 3) //Feature
		buffer.writeUInt8(128, 4) //Relative
		buffer.writeUInt8(1, 9) //?
		buffer.writeInt16BE(this.increment * (65535 / 100), 16) //OBS: Increment i %
		return buffer
	}
}

////////////////////////////////

export interface CameraControlAutoFocusProps {
	cameraId: number
}

export class CameraControlAutoFocusCommand extends BasicWritableCommand<CameraControlAutoFocusProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	constructor(cameraId: number) {
		super({ cameraId })
		this.cameraId = cameraId
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		//White balance, virker
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(0, 1) //Domain
		buffer.writeUInt8(1, 2) //Feature
		return buffer
	}
}

////////////////////////////////

export interface CameraControlWhitebalanceProps {
	cameraId: number
	kelvin: number
}
export class CameraControlWhitebalanceCommand extends BasicWritableCommand<CameraControlWhitebalanceProps> {
	public static readonly rawName = 'CCmd'

	readonly cameraId: number
	readonly kelvin: number

	constructor(cameraId: number, kelvin: number) {
		super({ cameraId, kelvin })
		this.cameraId = cameraId
		this.kelvin = kelvin
	}
	serialize() {
		const buffer = Buffer.alloc(24) //hvorfor ikke 32?
		//White balance, virker
		buffer.writeUInt8(this.cameraId, 0) //Input
		buffer.writeUInt8(1, 1) //Domain
		buffer.writeUInt8(2, 2) //Feature
		buffer.writeUInt8(0, 3) //Relative
		buffer.writeUInt8(2, 4) //?
		buffer.writeUInt8(1, 9) //?
		buffer.writeInt16BE(this.kelvin, 16) //Value in kelvin 2500-10000
		return buffer
	}
}

////////////////////////////////

export interface CameraControlUpdateProps {
	inputId: number
	properties: LensAdjustmentProps
}
export interface LensAdjustmentProps {
	focus: number
	iris: number
	autoIris: string
	ZoomPosition: number
	zoomSpeed: number
}

// Command to show state of camera control
// class CameraControlUpdateCommand extends DeserializedCommand<CameraControlUpdateProps> {
// 	public static readonly rawName = 'CCdP'

// 	readonly params: CameraControlUpdateProps

// 	constructor(inputId: number, properties: LensAdjustmentProps) {
// 		super({ inputId, properties })
// 		this.params = { inputId, properties }
// 	}
// 	static deserialize(rawCommand: Buffer) {
// 		//console.log(rawCommand);
// 		const cameraId = rawCommand.readUInt8(0)
// 		// const properties = {
// 		// 	cameraId: rawCommand.readUInt16BE(2)
// 		// }
// 		const properties = {}
// 		//const properties: any = { cameraId: rawCommand.readUInt8(0) }
// 		switch (rawCommand.readUInt8(1)) {
// 			case 0: // Adjustment: Lens
// 				this.lensAdjustment(rawCommand, properties)
// 				break
// 			case 1: // Adjustment: Camera
// 				this.cameraAdjustment(rawCommand, properties)
// 				break
// 			case 8: // Adjustment: Chip
// 				this.chipAdjustment(rawCommand, properties)
// 				break
// 			case 11: // Adjustment: PTZ Control
// 				this.ptzAdjustment(rawCommand, properties)
// 				break
// 			default:
// 				break
// 		}
// 		return new CameraControlUpdateCommand(cameraId, properties)
// 	}

// 	static lensAdjustment(rawCommand, properties: LensAdjustmentProps) {
// 		switch (rawCommand.readInt8(2)) {
// 			case 0: //  Focus
// 				properties.focus = (rawCommand.readUInt16BE(16) / 65535) * 100
// 				break
// 			case 1: //  Auto focus
// 				//properties.autoFocus = "auto";
// 				break
// 			case 2: //  Iris håndtag i software
// 				properties.iris = 100 - ((rawCommand.readUInt16BE(16) - 3072) / 15360) * 100
// 				break
// 			case 3: //  Iris knap på TV Studio
// 				properties.iris = 100 - (100 / 2048) * rawCommand.readUInt16BE(16)
// 				break
// 			case 5: //  Auto Iris
// 				properties.autoIris = 'auto'
// 				break
// 			case 8: //  ZoomPosition
// 				properties.ZoomPosition = (rawCommand.readUInt16BE(16) / 2048) * 100
// 				break
// 			case 9: //  Zoom
// 				properties.zoomSpeed = (rawCommand.readInt16BE(16) / 2048) * 100
// 				break
// 			default:
// 				break
// 		}
// 	}
// 	static cameraAdjustment(rawCommand, properties) {
// 		switch (rawCommand.readInt8(2)) {
// 			case 0: //  Videomode
// 				properties.framerate = rawCommand.readInt8(16)
// 				properties.mrate = rawCommand.readInt8(17)
// 				properties.dimensions = rawCommand.readInt8(18)
// 				properties.interlaced = rawCommand.readInt8(19)
// 				properties.colorspace = rawCommand.readInt8(20)
// 				break
// 			case 1: //  Old gain method (dont use)
// 				//properties.gain_db = rawCommand.readInt16BE(16);
// 				break
// 			case 13: //  New gain numbers
// 				properties.gain_db = rawCommand.readInt8(16)
// 				break
// 			case 2: //  White balance
// 				properties.whitebalance = rawCommand.readInt16BE(16)
// 				//properties.tint = rawCommand.readInt16BE(18);
// 				break
// 			case 5: //  Shutter OBS - den gør mærkeligt når man kommer under 1/50
// 				properties.shutter = rawCommand.readInt16BE(18)
// 				break
// 			case 7: //  Dynamic range
// 				properties.dynamicrange = rawCommand.readInt8(16)
// 				break
// 			case 8: //  Sharpen
// 				properties.sharpen = rawCommand.readInt8(16)
// 				break
// 			case 9: //  Recording format
// 				properties.framerate = rawCommand.readInt16BE(16)
// 				properties.sensorframerate = rawCommand.readInt16BE(18)
// 				properties.framewidth = rawCommand.readInt16BE(20)
// 				properties.frameheight = rawCommand.readInt16BE(22)
// 				properties.flags = rawCommand.readInt16BE(24)
// 				break
// 			default:
// 				break
// 		}
// 	}
// 	static chipAdjustment(rawCommand, properties) {
// 		switch (rawCommand.readInt8(2)) {
// 			case 0: //  Lift
// 				properties.lift_r = rawCommand.readInt16BE(16) / 4096
// 				properties.lift_g = rawCommand.readInt16BE(18) / 4096
// 				properties.lift_b = rawCommand.readInt16BE(20) / 4096
// 				properties.lift_l = rawCommand.readInt16BE(22) / 4096
// 				break
// 			case 1: //  Gamma
// 				properties.gamma_r = rawCommand.readInt16BE(16) / 8192
// 				properties.gamma_g = rawCommand.readInt16BE(18) / 8192
// 				properties.gamma_b = rawCommand.readInt16BE(20) / 8192
// 				properties.gamma_l = rawCommand.readInt16BE(22) / 8192
// 				break
// 			case 2: //  Gain
// 				properties.gain_r = rawCommand.readInt16BE(16) / 2047.9375
// 				properties.gain_g = rawCommand.readInt16BE(18) / 2047.9375
// 				properties.gain_b = rawCommand.readInt16BE(20) / 2047.9375
// 				properties.gain_l = rawCommand.readInt16BE(22) / 2047.9375
// 				break
// 			case 3: //  Aperature (virker ikke)
// 				break
// 			case 4: //  Contrast
// 				properties.contrast = (rawCommand.readUInt16BE(18) / 4096) * 100
// 				break
// 			case 5: //  Lumix (fra RGB til YRGB)
// 				properties.lumix = (rawCommand.readUInt16BE(16) / 2048) * 100
// 				break
// 			case 6: //  Saturation
// 				properties.hue = (rawCommand.readUInt16BE(16) / 4096) * 100
// 				properties.saturation = (rawCommand.readInt16BE(18) / 2048) * 100
// 				break
// 			default:
// 				break
// 		}
// 	}
// 	static ptzAdjustment(rawCommand, properties) {
// 		switch (rawCommand.readInt8(2)) {
// 			case 0: //  Pan/Tilt Velocity
// 				properties.pan_velocity = rawCommand.readInt16BE(16)
// 				properties.tilt_velocity = rawCommand.readInt16BE(18)
// 				break
// 			case 1: //  Memory Preset
// 				properties.preset_command = rawCommand.readInt8(16)
// 				properties.preset_slot = rawCommand.readInt8(17)
// 				break
// 			default:
// 				break
// 		}
// 	}
// 	applyToState(state) {
// 		state.cameras.camera[this.cameraId] = Object.assign(
// 			Object.assign({}, state.cameras.camera[this.cameraId]),
// 			this.properties
// 		)
// 		//return `camera ${this.properties}`
// 		return { [this.cameraId]: this.properties }
// 	}
// }
// exports.CameraControlUpdateCommand = CameraControlUpdateCommand
