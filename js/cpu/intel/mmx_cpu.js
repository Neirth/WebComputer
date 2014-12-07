/* PC Emulator wrapper
 * Created by: @fabricebellard
 * MODEL: PC_01
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
    include("mmx_cpu-ta.js");
} else {
    include("mmx_cpu-std.js");
    document.write('<canvas id="dummy_canvas" width="1" height="1"></canvas>');
}
