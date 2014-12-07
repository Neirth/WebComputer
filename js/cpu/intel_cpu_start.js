/* Intel CPU
  created by Fabrice Bellard
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
    include("intel_cpu-ta.js");
} else {
    include("intel_cpu-std.js");
    document.write('<canvas id="dummy_canvas" width="1" height="1"></canvas>');
}
