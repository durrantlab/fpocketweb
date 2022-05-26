// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


import * as Utils from "../../Utils";
//@ts-ignore
import template from "./templates/params.htm";

import { IConvert, IFileInfo, IFileLoadError } from "../FileLoaderSystem/Common/Interfaces";
import { saveOutputToLocalForage } from "../FileLoaderSystem/Queue/LocalForageWrapper";

declare var Vue;
declare var FpocketWeb;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Whether to hide the vina docking-box parameters.
     * @returns boolean  True if they should be hidden, false otherwise.
     */
    "hideDockingBoxParams"(): boolean {
        return this.$store.state.hideDockingBoxParams;
    },

    /** Whether to show the keep-protein-only link. Has both a getter and a setter. */
    "showKeepProteinOnlyLink": {
        get(): number {
            return this.$store.state["showKeepProteinOnlyLink"];
        },

        set(val: number): void {
            this.$store.commit("setVar", {
                name: "showKeepProteinOnlyLink",
                val: val
            });
        }
    },
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {

    "onQueueDelivery"(fileContents: { [key: string]: IFileInfo }): void {
        alert("onQueueDelivery: " + JSON.stringify(fileContents));
        let prom = saveOutputToLocalForage(
            "filename",
            fileContents["pdb"].mol.toText(),
            "dirname"
        )
        Promise.all([prom])
            .then(() => {
                this["triggerCatcher"] = !this["triggerCatcher"];
            });

        ////////
        this.$store.commit("setVar", {
            name: "pdbContents",
            val: fileContents["pdb"].mol.frameToText(0)
        });
    },

    // "onQueueNextItem"(): void {
    //     alert("onQueueNextItem");
    // },

    "onMolLoadError"(error: IFileLoadError): void {
        this.$store.commit("openModal", {
            title: error.title,
            body: error.body
        });

    },

    // "onExtractAtoms"(pdbText: string): void {
    //     alert("Extracted :: " + pdbText);
    // },

    "onFileReady"(currentPdbContents: string): void {
        this["currentPdbContents"] = currentPdbContents;
        this.$store.commit("setVar", {
            name: "pdbContents",
            //@ts-ignore
            val: currentPdbContents.mol.frameToText(0)
        });
        this.$store.commit("updateFileName", { type: "pdb", filename: currentPdbContents["filename"] });

        this.$store.commit("setValidationParam", {
            name: "pdb",
            val: true
        });
    },

    "onStartConvertFile"(val: IConvert): void {
        alert("convert: " + val.filename);
        setTimeout(() => {
            val.onConvertDone({
                filename: val.filename + ".pdb",
                mol: val.mol
            } as IFileInfo)
        }, 2000);

        // For purposes of testing, just return files.
        // for (let val of vals) {
        // val.onConvertDone({
        //     filename: val.filename + ".pdb",
        //     fileContents: val.fileContents
        // } as IFileInfo)
        // val.onConvertCancel("Could not convert: "  + val.filename);
        // }
    },

    "beforeQueueNextItem": () => {
        alert("About to trigger...");
        return Promise.resolve();
    },

    "useExampleFpocketInputFiles"(): void {
        this["showFileInputs"] = false;
        setTimeout(() => {
            // fetch the file 5j2v.pdb as a text file
            fetch("5j2v.pdb")
                .then(response => response.text())
                .then(pdbContentsExample => {
                    this.$store.commit("setVar", {
                        name: "pdbContents",
                        val: pdbContentsExample  // this.$store.state["pdbContentsExample"]
                    });
                    this.$store.commit("setValidationParam", {
                        name: "pdb",
                        val: true
                    });
                    // Also update file name so example fpocket command line is valid.
                    this.$store.commit("updateFileName", { type: "pdb", filename: "pdb_example.pdb" });
                });
        }, 100);
    },

    /**
     * Runs when the user presses the submit button.
     * @returns void
     */
    "onSubmitClick"(): void {
        if (this["validate"]() === true) {
            this.$store.commit("disableTabs", {
                "parametersTabDisabled": true,
                "existingFpocketOutputTabDisabled": true,
                "runningTabDisabled": false,
            });

            jQuery("body").addClass("waiting");

            Vue.nextTick(() => {
                this.$store.commit("setVar", {
                    name: "tabIdx",
                    val: 2
                });

                Vue.nextTick(() => {
                    // setTimeout(() => {
                    //     this.afterWASM(this["testVinaOut"], this["testStdOut"]);
                    // }, 1000);

                    // Keep track of start time
                    this.$store.commit("setVar", {
                        name: "time",
                        val: new Date().getTime()
                    });

                    FpocketWeb.start(
                        this.$store.state["fpocketParams"],
                        this.$store.state["pdbContents"],

                        // onDone
                        (outPdbqtFileTxt: string, stdOut: string, stdErr: string, pocketsContents: string) => {
                            this.$store.commit("setVar", {
                                name: "time",
                                val: Math.round((new Date().getTime() - this.$store.state["time"]) / 100) / 10
                            });
                            this.$store.commit("setVar", {
                                name: "pqrContents",
                                val: pocketsContents
                            });
                            this.$store.commit("setVar", {
                                name: "infoFile",
                                val: true
                            });

                            this.afterWASM(outPdbqtFileTxt, stdOut, stdErr);
                        },

                        // onError
                        (errObj: any) => {
                            // Disable some tabs
                            this.$store.commit("disableTabs", {
                                "parametersTabDisabled": true,
                                "existingFpocketOutputTabDisabled": true,
                                "runningTabDisabled": true,
                                "outputTabDisabled": true,
                                "startOverTabDisabled": false
                            });

                            this.showFpocketWebError(errObj["message"]);
                        },
                        Utils.curPath() + "FpocketWeb/"
                    )

                });
            });
        }
    },

    /**
     * Removes residues from protein model that are not protein amino acids.
     * @param  {any} e  The click event.
     * @returns void
     */
    "onShowKeepProteinOnlyClick"(e: any): void {
        let linesToKeep = Utils.keepOnlyProteinAtoms(this.$store.state["pdbContents"]);

        this.$store.commit("setVar", {
            name: "pdbContents",
            val: linesToKeep
        });
        // TODO: fix protein name!
        /*this.$store.commit("updateFileName", {
            type: "pdb",
            filename: Utils.replaceExt(
                this.$store.state["pdbName"],
                "protein.pdb"
            )
        });*/

        this["showKeepProteinOnlyLink"] = false;

        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * Determines whether all form values are valid.
     * @param  {boolean=true} modalWarning  Whether to show a modal if
     *                                      they are not valid.
     * @returns boolean  True if they are valid, false otherwise.
     */
    "validate"(modalWarning: boolean = true): boolean {
        let validations = this.$store.state["validation"];

        let pass = true;

        const paramName = Object.keys(validations);
        const paramNameLen = paramName.length;
        let badParams: string[] = [];
        for (let i = 0; i < paramNameLen; i++) {
            const name = paramName[i];

            if (name === "output") {
                // This one isn't part of the validation.
                continue;
            }

            const valid = validations[name];
            if (valid === false) {
                pass = false;
                badParams.push(name);
            }
        }

        if (pass === false) {
            if (modalWarning === true) {
                this.$store.commit("openModal", {
                    title: "Invalid Parameters!",
                    body: "<p>Please correct the following parameter(s) before continuing: <code>" + badParams.join(" ") + "</code></p>"
                });
            }
        }

        this.$store.commit("setVar", {
            name: "fpocketParamsValidates",
            val: pass
        })

        return pass;
    },

    /**
     * Runs after the Fpocket WASM file is complete.
     * @param  {string} outPdbqtFileTxt  The contents of the Vina output pdbqt file.
     * @param  {string} stdOut           The contents of the Vina standard output.
     * @param  {string} stdErr           The contents of the Vina standard error.
     * @returns void
     */
    afterWASM(outPdbqtFileTxt: string, stdOut: string, stdErr: string): void {
        // Disable some tabs
        this.$store.commit("disableTabs", {
            "parametersTabDisabled": true,
            "existingFpocketOutputTabDisabled": true,
            "runningTabDisabled": true,
            "outputTabDisabled": false,
            "startOverTabDisabled": false
        });

        // Switch to output tab.
        this.$store.commit("setVar", {
            name: "tabIdx",
            val: 3
        });

        this.$store.commit("setVar", {
            name: "stdOut",
            val: stdOut
        });
        this.$store.commit("setVar", {
            name: "outputContents",
            val: outPdbqtFileTxt
        });

        if (stdErr !== "") {
            this.showFpocketWebError(stdErr);
        }

        // Process the standard output (extract scores and rmsds) and
        // frames.
        this.$store.commit("outputToData");

        jQuery("body").removeClass("waiting");
    },

    /**
     * Shows a FPocketWeb error.
     * @param  {string} message  The error message.
     * @returns void
     */
    showFpocketWebError(message: string): void {
        this.$store.commit("openModal", {
            title: "FPocketWeb Error!",
            body: "<p>FPocketWeb returned the following error: <code>" + message + "</code></p>"
        });
    }
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    //this["webAssemblyAvaialble"] = Utils.webAssemblySupported();
    this["webAssemblyAvaialble"] = true;
}

/**
 * Setup the vina-params Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('fpocket-params', {
        "template": template,
        "props": {},
        //"computed": computedFunctions,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "currentPdbContents": "",
                "triggerCatcher": false,
                "triggerController": false,
                "showFileInputs": true,
                "webAssemblyAvaialble": true
            }
        },
        "methods": methodsFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction
    })
}
