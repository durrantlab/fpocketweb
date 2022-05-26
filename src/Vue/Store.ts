// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


import * as Utils from "../Utils";

declare var Vuex;

interface IVueXStoreSetVar {
    name: string;
    val: any;
}

interface iVueXParam {
    stateVarName?: string;
    name: string;
    val: any;
}

interface IParamAccess {
    stateVarName: string;
    name: string;
}

interface IModal {
    title: string;
    body: string;
}

interface IFileConvertModal {
    ext: string;
    type: string;
    file: string;
}

interface IInputFileNames {
    type: string;
    filename: string;
}

export const store = new Vuex.Store({
    "state": {
        "fpocketParams": {},
        "validation": {pdb: false},
        "testVar": "",
        hideDockingBoxParams: false,
        "tabIdx": 0,
        "pdbFileName": "",
        "pdbFileNameTrimmed": "",
        "pdbContents": "",
        "pocketsContents": "{}",
        "pocketsToRender": [],
        "infoTableOnlyOneLineSelected": false,
        "infoTableSelectedLine": -1,
        "pocketsColors": "{}",
        "pocketsOpacity": "{}",
        "pocketsToRemove": [],
        "pqrContents": "",
        "showKeepProteinOnlyLink": true,
        "ligandContents": "",
        "outputContents": "",
        "dockedContents": "",
        "parametersTabDisabled": false,
        "existingFpocketOutputTabDisabled": false,
        "runningTabDisabled": true,
        "startOverTabDisabled": true,
        "outputTabDisabled": true,
        "pdbOutputFrames": [],
        "infoFile": false,
        "showSubpex": true,
        "stdOut": "",
        "modalShow": false,
        "modalTitle": "Title",
        "modalBody": "Some text here...",
        "fpocketParamsValidates": false,
        "time": 0  // Used to keep track of execution time.
    },
    "mutations": {
        /**
         * Set one of the VueX store variables.
         * @param  {any}              state    The VueX state.
         * @param  {IVueXStoreSetVar} payload  An object containing
         *                                     information about which
         *                                     variable to set.
         * @returns void
         */
        "setVar"(state: any, payload: IVueXStoreSetVar): void {
            state[payload.name] = payload.val;

        },

        /**
         * Set one of the vina parameters.
         * @param  {any}        state    The VueX state.
         * @param  {iVueXParam} payload  An object with information about
         *                               which vina parameter to set.
         * @returns void
         */
        "setFpocketParam"(state: any, payload: iVueXParam): void {
            // By redefining the whole variable, it becomes reactive. Directly
            // changing individual properties is not reactive.
            state["fpocketParams"] = Utils.getNewObjWithUpdate(
                state["fpocketParams"],
                payload.name,
                payload.val
            );
            // state.hideDockingBoxParams = state["fpocketParams"]["score_only"] === true
        },

        /**
         * Set a validation parameter (either validates or doesn't).
         * @param  {any}        state    The VueX state.
         * @param  {iVueXParam} payload  An object containing information
         *                               about what to set.
         * @returns void
         */
        "setValidationParam"(state: any, payload: iVueXParam): void {
            // By redefining the whole variable, it becomes reactive. Directly
            // changing individual properties is not reactive.
            state["validation"] = Utils.getNewObjWithUpdate(
                state["validation"],
                payload.name,
                payload.val
            );
        },

        /**
         * Disable or enable tabs.
         * @param  {any} state    The VueX stste.
         * @param  {any} payload  An object containing information about which
         *                        tabs should be enabled or disabled.
         * @returns void
         */
        "disableTabs"(state: any, payload: any): void {
            const tabDisableVarNames = Object.keys(payload);
            const tabDisableVarNamesLen = tabDisableVarNames.length;
            for (let i = 0; i < tabDisableVarNamesLen; i++) {
                const tabDisableVarName = tabDisableVarNames[i];
                let val = payload[tabDisableVarName];
                val = val === undefined ? true : val;
                state[tabDisableVarName] = val;
            }

            // If the output tab has been enabled, you should also warn the
            // user about closing the website.
            if (payload["outputTabDisabled"] === false) {
                window.addEventListener("beforeunload", (event) => {
                    event.preventDefault();

                    // No modern browser respects the returnValue anymore. See
                    // https://stackoverflow.com/questions/45088861/whats-the-point-of-beforeunload-returnvalue-if-the-message-does-not-get-set
                    event.returnValue = "";
                });
            }
        },

        /**
         * Extract and save relevant data about the poses from the Vina
         * output.
         * @param  {any} state  The VueX state.
         * @returns void
         */
        "outputToData"(state: any): void {
            let data = [];

            let outPdbqtFileTxt = state["outputContents"];

            // Get info like score and rmsd from output file.
            let re = /^REMARK VINA RESULT:\W+?([0-9\.\-]+)\W+?([0-9\.\-]+)\W+?([0-9\.\-]+)$/gm
            let match;
            let i = 1;
            while (match = re.exec(outPdbqtFileTxt)) {
                data.push([
                    i, match[1], match[2], match[3]
                ].map(d => +d));
                i++;
            }

            // Get pdb frames from output pdbqt file.
            let framesPDBQTs = outPdbqtFileTxt.split("ENDMDL");
            let framePDBs = "undefined";
            // let framePDBs = framesPDBQTs
            //                 .map(t => ThreeDMol.pdbqtToPDB(t, this.$store))
            //                 .filter(t => t !== "")
            //                 .map((t, i) => { return [data[i], t]; });
            state["pdbOutputFrames"] = framePDBs;

            // Set the first docked frame as the selected one.
            state["dockedContents"] = framePDBs[0][1];
        },

        /**
         * Open the modal.
         * @param  {*}      state    The VueX state.
         * @param  {IModal} payload  An object with the title and body.
         * @returns void
         */
        "openModal"(state: any, payload: IModal): void {
            state["modalTitle"] = payload.title;
            state["modalBody"] = payload.body;
            state["modalShow"] = true;
            jQuery("body").removeClass("waiting");
        },

        /**
         * Open the modal.
         * @param  {*}                 state    The VueX state.
         * @param  {IFileConvertModal} payload  An object with the ext, type,
         *                                      and file.
         * @returns void
         */
        "openConvertFileModal"(state: any, payload: IFileConvertModal): void {
            state["convertFileModalShow"] = true;
            state["convertFileExt"] = payload.ext;
            state["convertFileType"] = payload.type;
            state["convertFile"] = payload.file;
            jQuery("body").removeClass("waiting");
        },

        /**
         * Update the filenames of the receptor and ligand input files.
         * @param  {any}             state    The VueX state.
         * @param  {IInputFileNames} payload  An object describing the
         *                                    filename change.
         * @returns void
         */
        "updateFileName"(state: any, payload: IInputFileNames): void {
            // Also update file names so example vina command line is valid.
            state[payload.type + "FileName"] = payload.filename;
            // FileNameTrimmed is used to construct directories pathes later on
            state[payload.type + "FileNameTrimmed"] = payload.filename.replace(/\.[^/.]+$/, "");
        }
    }
});

// Good for debugging.
window["store"] = store;
