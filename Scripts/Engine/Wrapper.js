/* PC Emulator wrapper
 * Created by: @fabricebellard
 * MODEL: PC_01
 */
"use strict";
var include = function (filename) {
    document.write('<script type="text/javascript" src="' + filename +
        '"><' + '/script>');
}

function test_typed_arrays()
{
    return (window.Uint8Array &&
            window.Uint16Array &&
            window.Int32Array &&
            window.ArrayBuffer);
}

if (test_typed_arrays()) {
    include("Scripts/Engine/Processor.js");
} else {
    include("Scripts/Engine/Processor.js");
    document.write('<canvas id="dummy_canvas" width="1" height="1"></canvas>');
}
