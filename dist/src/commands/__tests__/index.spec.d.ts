import { ProtocolVersion } from '../../enums';
export declare type CommandTestConverterSet = {
    [key: string]: CommandTestConverter;
};
export interface PropertyAliasResult {
    name?: string;
    val: any;
}
export interface CommandTestConverter {
    /** Internal name to LibAtem name */
    idAliases: {
        [internalName: string]: string;
    };
    /** LibAtem name to Internal name & mutated value */
    propertyAliases: {
        [libName: string]: (v: any) => PropertyAliasResult;
    };
    /** Mutate the TestCase before comparing */
    customMutate?: (v: any) => any;
    /** pre-process deserialized command */
    processDeserialized?: (v: any) => void;
}
export interface TestCase {
    name: string;
    firstVersion: ProtocolVersion;
    bytes: string;
    command: {
        [key: string]: any;
    };
}
//# sourceMappingURL=index.spec.d.ts.map