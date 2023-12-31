// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


// There are a few variables and functions from vina.js that I want to easily
// access from here.

let VERSION = "XXXXXXXXXXXXX.X"  // Replaced by compile script.
console.log("FPocketWeb");
console.log("    Compiled from the Fpocket codebase:");
console.log("    https://github.com/Discngine/fpocket")

var FPOCKET_Module: any

interface IFpocketParams {
    pdbFile: string;
    calculate_interaction_grids?: boolean;
    pocket_descr_stdout?: boolean;
    model_number?: number;
    topology_file?: string;
    min_alpha_size?: number;
    max_alpha_size?: number;
    clustering_distance?: number;
    clustering_method?: string;
    clustering_measure?: string;
    min_spheres_per_pocket?: number;
    ratio_apol_spheres_pocket?: number;
    number_apol_asph_pocket?: number;
    iterations_volume_mc?: number;
}


// A shiv for decodeBase64.
var decodeBase64 = "function" == typeof atob ? atob : function (r) {
    var e, t, a, i, n, o, f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        m = "",
        s = 0;
    for (r = r.replace(/[^A-Za-z0-9\+\/\=]/g, ""); e = f.indexOf(r.charAt(s++)) << 2 | (i = f.indexOf(r.charAt(s++))) >> 4, t = (15 & i) << 4 | (n = f.indexOf(r.charAt(s++))) >> 2, a = (3 & n) << 6 | (o = f.indexOf(r.charAt(s++))), m += String.fromCharCode(e), 64 !== n && (m += String.fromCharCode(t)), 64 !== o && (m += String.fromCharCode(a)), s < r.length;)
        return m
};

// Make FPocketWeb global namespace.
let FpocketWeb = (function () {
    return {
        FPOCKET_ENVIRONMENT_IS_NODE: window["FPOCKET_ENVIRONMENT_IS_NODE"],
        FPOCKET_lengthBytesUTF8: window["FPOCKET_lengthBytesUTF8"],
        FPOCKET_stringToUTF8Array: window["FPOCKET_stringToUTF8Array"],
        FPOCKET_assert: window["FPOCKET_assert"],
        FPOCKET_ASSERTIONS: 1,
        FPOCKET_DATA_URI_PREFIX: "data:application/octet-stream;base64,",
        FPOCKET_BASE_URL: "./",
        FS: window["FS"],

        start: function start(fpocketParams: IFpocketParams, pdbFile: string, onDone?: any, onError?: any, baseUrl?: string): void {
            // baseUrl = undefined;  // For debugging.
            let baseUrlMsg = "\nFPOCKET\n======\n\n";
            if (baseUrl !== undefined) {
                if (baseUrl.slice(baseUrl.length - 1) !== "/") {
                    baseUrl += "/";
                }
                this.FPOCKET_BASE_URL = baseUrl;
                baseUrlMsg += "User specified baseUrl: " + baseUrl + "\n";
            } else {
                baseUrlMsg += "No baseUrl specified, so using ./\n\n";
                baseUrlMsg += "Use FpocketWeb.start() to specify the baseUrl:\n";
                baseUrlMsg += "    function start(fpocketParams, pdbFile, \n"
                baseUrlMsg += "                   onDone, \n";
                baseUrlMsg += "                   onError, baseUrl)\n";
            }
            baseUrlMsg += "\nExpecting files at the following locations:\n";
            for (let i = 0; i < 4; i++) {
                const fileName = ["FpocketWeb.min.js", "fpocket.min.js", "fpocket.wasm", "fpocket.data"][i];
                baseUrlMsg += "    " + (baseUrl === undefined ? "./" : baseUrl) + fileName + "\n";
            }
            baseUrlMsg += "\n";

            if (baseUrl !== undefined) {
                console.log(baseUrlMsg);
            } else {
                console.warn(baseUrlMsg);
            }

            if (onError === undefined) {
                onError = () => {
                    console.log("FPocketWeb encountered an error! Does your browser support WebAssembly?");
                }
            }

            // Create a module object for WASM.
            FPOCKET_Module = {
                "preRun": [],
                "postRun": [],
                "stdOut": "",
                "stdErr": "",
                "print": function () {
                    return function (e) {
                        1 < arguments.length && (
                            e = Array.prototype.slice.call(arguments).join(" ")
                        ),
                            window["FPOCKET_Module"]["stdOut"] += e + "\n"
                    }
                }(),
                "printErr": function (e) {
                    // 1 < arguments.length && (e = Array.prototype.slice.call(arguments).join(" ")), console.error(e)
                    1 < arguments.length && (
                        e = Array.prototype.slice.call(arguments).join(" ")
                    ),
                        window["FPOCKET_Module"]["stdErr"] += e + "\n"
                },
                "setStatus": (e) => {
                    if (e === "") {
                        // This happens when it is done running.
                        if (onDone !== undefined) {
                            const pdbBaseNameTrimmed = window["store"]["state"]['pdbFileNameTrimmed'];
                            let outTxt: string = new TextDecoder("utf-8").decode(
                                window["FS"]["readFile"]('/' + pdbBaseNameTrimmed + '_out/' + pdbBaseNameTrimmed + '_out.pdb')
                            );
                            let stdOut: string = window["FPOCKET_Module"]["stdOut"];
                            let stdErr: string = window["FPOCKET_Module"]["stdErr"];
                            let pocketsContents = new TextDecoder("utf-8").decode(
                                window["FS"]["readFile"]('/' + pdbBaseNameTrimmed + '_out/' + pdbBaseNameTrimmed + '_pockets.pqr')
                            );
                            onDone(outTxt, stdOut, stdErr, pocketsContents);
                        }
                    }
                },
                "onError": onError,
                "catchError": (n) => {
                    onError(n);
                    // throw n;  // Don't throw the errr. You're catching it now.
                },
                "pdbFile": pdbFile
            };

            if (fpocketParams["pdbFile"] !== undefined) {
                console.warn("FPocketWeb does not support Vina's --receptor parameter. Instead, pass the content of the receptor file as a string to the webina.start() function.");
            }

            // Receptor and ligand files are always the same.
            FPOCKET_Module['arguments'] = [
                '-f', window["store"]["state"]['pdbFileName'],
            ];
            function waitForElement() {
                if (typeof FPOCKET_Module["FS_createDataFile"] !== "undefined") {
                    let pdbBaseName = window["store"]["state"]['pdbFileName'];
                    let pdbBaseNameTrimmed = pdbBaseName.replace(/\.[^/.]+$/, "");
                    //variable exists, do what you want
                    console.log("filecreate called");
                    FPOCKET_Module["FS_createDataFile"]('/', pdbBaseName, window["store"]["state"]["pdbContents"], true, true, true);
                    //FPOCKET_Module["FS_createPath"]('/', pdbBaseNameTrimmed + '_out', true, true);
                    //FPOCKET_Module["FS_createPath"]('/' + pdbBaseNameTrimmed + '_out', 'pockets', true, true);
                }
                else {
                    setTimeout(waitForElement, 500);
                }
            }

            //waitForElement();




            // For some reason, WebAssembly always uses one more processor
            // than specified. Compensate for that here. But sometimes it
            // doesn't, so commenting out... Confusing.
            // if ((vinaParams["cpu"] !== undefined) && (vinaParams["cpu"] > 1)) {
            //     vinaParams["cpu"] = vinaParams["cpu"] - 1;
            // }

            // Add in the remaining values. Note that there is no validation here.
            const paramNames = Object.keys(fpocketParams);
            const paramNamesLen = paramNames.length;
            for (let i = 0; i < paramNamesLen; i++) {
                const key = paramNames[i];
                const val = fpocketParams[key];
                FPOCKET_Module['arguments'].push('--' + key);

                if (typeof (val) !== "boolean") {
                    FPOCKET_Module['arguments'].push(String(val));
                }
            }

            window["FPOCKET_Module"] = FPOCKET_Module;

            // Initialize the memory
            /* let memoryInitializer = this.FPOCKET_BASE_URL + "fpocket.html.mem";
             memoryInitializer = FPOCKET_Module["locateFile"] ? FPOCKET_Module["locateFile"](memoryInitializer, "") : memoryInitializer, FPOCKET_Module["memoryInitializerRequestURL"] = memoryInitializer;
 
             let meminitXHR = FPOCKET_Module["memoryInitializerRequest"] = new XMLHttpRequest;
 
             meminitXHR.onloadend = () => {
                 if (meminitXHR.status === 404) {
                     let msg = "Unable to access " + memoryInitializer +". See JavaScript console for warnings. The \"baseUrl\" variable passed to FPocketWeb is likely incorrect.";
                     FPOCKET_Module["catchError"]({"message": msg});
                     console.warn(msg);
                 } else {
                     */
            var script = document.createElement("script");
            script.src = this.FPOCKET_BASE_URL + "fpocket.js";
            document.body.appendChild(script)
            /* }
       //  }

         meminitXHR.open("GET", memoryInitializer, !0);
         meminitXHR.responseType = "arraybuffer";
         meminitXHR.send(null);
         */
            // window["FS"].createDataFile('/', 'test', "fsdfsd", true, true, true);

        },

        isDataURI: function (r) {
            //return String.prototype.startsWith ? r.startsWith(this.WEBINA_DATA_URI_PREFIX) : 0 === r.indexOf(this.WEBINA_DATA_URI_PREFIX)
            return true
        },

        intArrayFromBase64: function (e) {
            if ("boolean" == typeof this.FPOCKET_ENVIRONMENT_IS_NODE && this.FPOCKET_ENVIRONMENT_IS_NODE) {
                var t;
                try {
                    t = Buffer.from(e, "base64")
                } catch (r) {
                    t = new Buffer(e, "base64")
                }
                return new Uint8Array(t.buffer, t.byteOffset, t.byteLength)
            }
            try {
                for (var r = decodeBase64(e), a = new Uint8Array(r.length), i = 0; i < r.length; ++i) a[i] = r.charCodeAt(i);
                return a
            } catch (r) {
                throw new Error("Converting base64 string to bytes failed.")
            }
        },

        // Not used?
        tryParseAsDataURI: function (r) {
            if (this.isDataURI(r)) return this.intArrayFromBase64(r.slice(this.FPOCKET_DATA_URI_PREFIX.length))
        },

        // Not used?
        intArrayFromString: function (r, e, t) {
            var a = 0 < t ? t : this.FPOCKET_lengthBytesUTF8(r) + 1,
                i = new Array(a),
                n = this.FPOCKET_stringToUTF8Array(r, i, 0, i.length);
            return e && (i.length = n), i
        },

        // Not used?
        intArrayToString: function (r) {
            for (var e = [], t = 0; t < r.length; t++) {
                var a = r[t];
                255 < a && (this.FPOCKET_ASSERTIONS && this.FPOCKET_assert(!1, "Character code " + a + " (" + String.fromCharCode(a) + ")  at offset " + t + " not in 0x00-0xFF."), a &= 255), e.push(String.fromCharCode(a))
            }
            return e.join("")
        }
    };
})();
