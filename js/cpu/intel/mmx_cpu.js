/* Intel MMX CPU
 * Created by @fabricebellard
 * Model: INTELMMX_01
 */
"use strict";

function test_typed_arrays()
{
    return (window.Uint8Array &&
            window.Uint16Array &&
            window.Int32Array &&
            window.ArrayBuffer);
}

if (test_typed_arrays()) {
    include("mmx_ta.js");
}
