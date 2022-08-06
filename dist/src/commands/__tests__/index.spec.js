"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable jest/no-export */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const atemCommandParser_1 = require("../../lib/atemCommandParser");
const enums_1 = require("../../enums");
const CommandBase_1 = require("../CommandBase");
const util_1 = require("../../__tests__/util");
const converters_default_1 = require("./converters-default");
const converters_8_0_1 = require("./converters-8.0");
const fs_1 = require("fs");
const path_1 = require("path");
const testCasePath = (0, path_1.resolve)(__dirname, `./libatem-data.json`);
const TestCases = JSON.parse((0, fs_1.readFileSync)(testCasePath).toString());
function runTestForCommand(commandParser, i, testCase, allowUnknown) {
    commandParser.version = testCase.firstVersion;
    const cmdConstructor = commandParser.commandFromRawName(testCase.name);
    if (!cmdConstructor && allowUnknown)
        return;
    const versionName = enums_1.ProtocolVersion[testCase.firstVersion] || `v${testCase.firstVersion}`;
    // if (i !== 1181) {
    // 	return
    // }
    let matchedCase = false;
    if (cmdConstructor) {
        const buffer = Buffer.from(testCase.bytes.replace(/-/g, ''), 'hex');
        const length = buffer.readUInt16BE(0);
        const name = buffer.toString('ascii', 4, 8);
        let converter = converters_default_1.DefaultCommandConverters[name];
        if (testCase.firstVersion >= enums_1.ProtocolVersion.V8_0) {
            converter = converters_8_0_1.V8_0CommandConverters[name] || converter;
        }
        let mutatedCommand = {};
        for (const key in testCase.command) {
            const newKey = key[0].toLowerCase() + key.substring(1);
            const propConv = converter
                ? converter.propertyAliases[`${name}.${newKey}`] || converter.propertyAliases[newKey]
                : undefined;
            const newProp = propConv ? propConv(testCase.command[key]) : { val: testCase.command[key] };
            if (newProp.name) {
                const p = newProp.name.split('.');
                let o = mutatedCommand;
                for (let i = p.shift(); i !== undefined; i = p.shift()) {
                    if (p.length) {
                        o[i] = { ...o[i] };
                        o = o[i];
                    }
                    else {
                        o[i] = newProp.val;
                    }
                }
            }
            else {
                mutatedCommand[newKey] = newProp.val;
            }
        }
        if (converter && converter.customMutate) {
            mutatedCommand = converter.customMutate(mutatedCommand);
        }
        if (typeof cmdConstructor.deserialize === 'function') {
            matchedCase = true;
            test(`Test #${i}: ${testCase.name} (${versionName}) - Deserialize`, () => {
                const cmd = cmdConstructor.deserialize(buffer.slice(0, length).slice(8), testCase.firstVersion);
                // delete cmd.flag // Anything deserialized will never have flags
                // delete (cmd as any).rawCommand
                if (converter) {
                    if (converter.processDeserialized) {
                        converter.processDeserialized(cmd.properties);
                    }
                    for (const key in cmd) {
                        const newName = converter.idAliases[key];
                        if (Object.prototype.hasOwnProperty.call(cmd, key) && newName) {
                            if (!cmd.properties)
                                cmd.properties = {};
                            cmd.properties[newName] = cmd[key];
                        }
                    }
                }
                expect(cmd.properties).toEqual(mutatedCommand);
                const state = (0, util_1.createEmptyState)(cmd);
                // Ensure state update doesnt error
                expect(cmd.applyToState(state)).toBeTruthy();
            });
        }
        const cmd = new cmdConstructor(); // constructor params get filled in below
        if (typeof cmd.serialize === 'function') {
            matchedCase = true;
            test(`Test #${i}: ${testCase.name} (${versionName}) - Serialize`, () => {
                if (converter) {
                    for (const id of Object.keys(converter.idAliases)) {
                        const id2 = converter.idAliases[id];
                        cmd[id] = mutatedCommand[id2];
                        delete mutatedCommand[id2];
                    }
                }
                if (mutatedCommand.mask !== undefined) {
                    ;
                    cmd.flag = mutatedCommand.mask;
                    delete mutatedCommand.mask;
                }
                if (cmd instanceof CommandBase_1.SymmetricalCommand) {
                    // These properties are stored in slightly different place
                    ;
                    cmd.properties = mutatedCommand;
                }
                else {
                    ;
                    cmd._properties = mutatedCommand;
                }
                // Ensure all properties appear in the mask
                const maskProps = cmd.constructor.MaskFlags;
                if (maskProps) {
                    for (const key of Object.keys(mutatedCommand)) {
                        // eslint-disable-next-line jest/no-conditional-expect
                        expect(maskProps).toHaveProperty(key);
                        // expect(maskProps[key]).not.toBeUndefined()
                    }
                }
                const hexStr = (buf) => {
                    const str = buf.toString('hex');
                    let str2 = '';
                    for (let i = 0; i < str.length; i += 2) {
                        str2 += str[i + 0] + str[i + 1];
                        str2 += i % 16 === 14 ? '\n' : '-';
                    }
                    return str2.substring(0, str2.length - 1);
                };
                const encodedBytes = cmd.serialize(testCase.firstVersion);
                // console.log(hexStr(buffer.slice(4)))
                expect(length).toEqual(encodedBytes.length + 8);
                expect(hexStr(buffer.slice(8))).toEqual(hexStr(encodedBytes));
            });
        }
    }
    if (!matchedCase) {
        test(`Test #${i}: ${testCase.name} - Skip`, () => {
            // Command should have either a serialize or deserialize
            expect(false).toBeTruthy();
        });
    }
}
describe('Commands vs LibAtem', () => {
    const commandParser = new atemCommandParser_1.CommandParser();
    test('Ensure all commands have test cases', () => {
        // Verify that all commands were tested
        let knownNames = [];
        for (const [name, cmds] of Object.entries(commandParser.commands)) {
            for (const cmd of cmds) {
                knownNames.push(`${name}_${cmd.minimumVersion || enums_1.ProtocolVersion.V7_2}`);
            }
        }
        // knownNames = Object.keys(commandParser.commands).sort()
        const testNames = Array.from(new Set(TestCases.map((c) => `${c.name}_${c.firstVersion}`)))
            .filter((n) => knownNames.indexOf(n) !== -1)
            .sort();
        // Temporarily ignore these missing cases
        knownNames = knownNames.filter((n) => !n.startsWith('InCm') && !n.startsWith('TlSr') && !n.startsWith('_VMC'));
        knownNames.sort();
        expect(testNames).toEqual(knownNames);
    });
    for (let i = 0; i < TestCases.length; i++) {
        const testCase = TestCases[i];
        switch (testCase.name) {
            // Temporarily ignore the failures
            case 'KeFS': // TODO - TMP!
            case '_MvC': // Not all properties parsed
            case 'FTSU': // Unkown props getting overwritten by generator: https://github.com/LibAtem/LibAtem/blob/master/LibAtem/Commands/DataTransfer/DataTransferDownloadRequestCommand.cs
                continue;
        }
        runTestForCommand(commandParser, i, testCase, true);
    }
});
//# sourceMappingURL=index.spec.js.map