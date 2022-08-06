"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/unbound-method */
const index_1 = require("../index");
const util_1 = require("./util");
test('Simple test', async () => {
    const nb = new index_1.Atem({ disableMultithreaded: true });
    try {
        nb.on('error', () => null);
        expect(nb).toBeTruthy();
    }
    finally {
        await nb.destroy();
    }
});
function createConnection(apiVersion) {
    const conn = new index_1.Atem({ debugBuffers: true, disableMultithreaded: true });
    // Create a state object
    const state = (0, util_1.createEmptyState)();
    state.info.apiVersion = apiVersion;
    // conn.on('error', () => null)
    conn.sendCommand = jest.fn();
    conn._state = state;
    return conn;
}
test('setSuperSourceProperties - 7.2', async () => {
    const conn = createConnection(index_1.Enums.ProtocolVersion.V7_2);
    try {
        expect(conn.sendCommand).not.toHaveBeenCalled();
        await conn.setSuperSourceProperties({
            artPreMultiplied: true,
            artOption: index_1.Enums.SuperSourceArtOption.Background,
        }, 2);
        expect(conn.sendCommand).toHaveBeenCalledTimes(1);
        expect(conn.sendCommand).toHaveBeenNthCalledWith(1, {
            flag: 12,
            _properties: {
                artOption: 0,
                artPreMultiplied: true,
            },
        });
    }
    finally {
        await conn.destroy();
    }
});
test('setSuperSourceProperties - 8.0', async () => {
    const conn = createConnection(index_1.Enums.ProtocolVersion.V8_0);
    try {
        expect(conn.sendCommand).not.toHaveBeenCalled();
        await conn.setSuperSourceProperties({
            artPreMultiplied: true,
            artOption: index_1.Enums.SuperSourceArtOption.Background,
        }, 2);
        expect(conn.sendCommand).toHaveBeenCalledTimes(1);
        expect(conn.sendCommand).toHaveBeenNthCalledWith(1, {
            ssrcId: 2,
            flag: 12,
            _properties: {
                artOption: 0,
                artPreMultiplied: true,
            },
        });
    }
    finally {
        await conn.destroy();
    }
});
test('setSuperSourceBorder - 7.2', async () => {
    const conn = createConnection(index_1.Enums.ProtocolVersion.V7_2);
    try {
        expect(conn.sendCommand).not.toHaveBeenCalled();
        await conn.setSuperSourceBorder({
            borderBevelSoftness: 12,
            borderLuma: 3,
        }, 2);
        expect(conn.sendCommand).toHaveBeenCalledTimes(1);
        expect(conn.sendCommand).toHaveBeenNthCalledWith(1, {
            flag: 139264,
            _properties: {
                borderBevelSoftness: 12,
                borderLuma: 3,
            },
        });
    }
    finally {
        await conn.destroy();
    }
});
test('setSuperSourceBorder - 8.0', async () => {
    const conn = createConnection(index_1.Enums.ProtocolVersion.V8_0);
    try {
        expect(conn.sendCommand).not.toHaveBeenCalled();
        await conn.setSuperSourceBorder({
            borderBevelSoftness: 12,
            borderLuma: 3,
        }, 2);
        expect(conn.sendCommand).toHaveBeenCalledTimes(1);
        expect(conn.sendCommand).toHaveBeenNthCalledWith(1, {
            ssrcId: 2,
            flag: 1088,
            _properties: {
                borderBevelSoftness: 12,
                borderLuma: 3,
            },
        });
    }
    finally {
        await conn.destroy();
    }
});
//# sourceMappingURL=index.spec.js.map