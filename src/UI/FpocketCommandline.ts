// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { saveBlob } from "../Utils";

declare var Vue;
// declare var FileSaver;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Determines whether the provided vina parameters validate.
     * @returns boolean  True if the validate, false otherwise.
     */
    "fpocketParamsValidate"(): boolean {
        return this.$store.state["fpocketParamsValidates"];
    },

    /**
     * Generates a mock vina command line.
     * @returns string  The mock command line.
     */
    "commandlineStr"(): string {
        if (this.fpocketParamsValidate === false) {
            return "First fix parameter problems above..."
        } else {
            let params = this.$store.state["fpocketParams"];

            const paramNames = Object.keys(params);
            const paramNamesLen = paramNames.length;
            const keyValPairs = [];
            for (let i = 0; i < paramNamesLen; i++) {
                const paramName = paramNames[i];
                const val = params[paramName];
                if ((val !== false) && (val !== null) && (val !== undefined)) {
                    let keyValPair = [paramName];
                    if (typeof(val) !== "boolean") {
                        keyValPair.push(val.toString())
                    } else {
                        keyValPair.push("")
                    }
                    keyValPairs.push(keyValPair);
                }
            }
            keyValPairs.sort();

            let cmdStr = "";
            const keyValPairsLen = keyValPairs.length;
            for (let i = 0; i < keyValPairsLen; i++) {
                const keyValPair = keyValPairs[i];
                const paramName = keyValPair[0];
                const val = keyValPair[1];
                cmdStr = cmdStr + " --" + paramName;
                if (val !== "") {
                    cmdStr = cmdStr + " " + val.toString();
                }
            }

            return "/path/to/fpocket " +
                    "--file " + this.$store.state["pdbFileName"] +
                    cmdStr;
        }
    },
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {

    /**
     * Downloads either the receptor or ligand files.
     * @param  {*}      e     The click event.
     * @returns void
     */
    "downloadPdbFile"(e: any): void {
        var blob = new Blob([this.$store.state["pdbContents"]], {
            type: "text/plain;charset=utf-8"
        });
        saveBlob(blob, this.$store.state["pdbFileName"]);

        e.preventDefault();
        e.stopPropagation();
    }
}

/**
 * Setup the vina-commandline Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('fpocket-commandline', {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {}
        },
        "computed": computedFunctions,
        "methods": methodsFunctions,
        "template": `
            <sub-section v-if="fpocketParamsValidate" title="Run Fpocket from the Command Line">
                <p>
                    FPocketWeb is convenient but slower than stand-alone Fpocket.
                    You may wish to <a href="https://github.com/Discngine/fpocket"
                    target="_blank">download a binary copy</a>
                    of Fpocket to run from the command line instead.
                </p>
                <form-group
                    id="input-group-commandline"
                    description="Type this command into the command line (replacing the path) to run command-line Fpocket with your specified parameters."
                >
                    <b-form-input
                        name="commandline"
                        v-model="commandlineStr"
                        type="text"
                        readonly
                    ></b-form-input>

                    <template v-slot:extraDescription>
                        Click to download the <a href="" @click="downloadPdbFile($event);">protein</a> PDB file.
                    </template>
                </form-group>
            </sub-section>
        `,
        "props": {}
    })
}
