// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


declare var Vue;
import { saveBlob } from "../../Utils";
// declare var FileSaver;

//@ts-ignore
import template from "./templates/output.htm";

/**
 * An object containing the vue-component watch functions
 */
let watchFunctions = {
    "pocketsRendered": function (newPocketsRendered: any, oldPocketsRendered: any): void {
        // The purpose of this is to react when new elements of pocketsRendered is hanged.
        this.selected = this.$store.state["pocketsRendered"];
    },

    "selected": function (newSelectedPockets: any, oldSelectedPockets: any): void {
        this.$store.commit("setVar", {
            name: "selectedPockets",
            val: this.selected
        });
    },
}


/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Get's Fpocket's standard output.
     * @returns string  The standard output.
     */
    "stdOut"(): string {
        return this.$store.state["stdOut"];
    },
    /**
         * Get the value of the totalPocketsDetected variable
         */
    "totalPocketsDetected"(): any {
        return this.$store.state["totalPocketsDetected"];
    },

    /**
     * Get's Fpocket's output file.
     * @returns string  The output file.
     */
    "outputContents"(): string {
        // TODO - find a better place to call populateItems()
        //this.populateItems();
        return this.$store.state["outputContents"];
    },

    "pocketsRendered"(): string {
        return this.$store.state["pocketsRendered"];
    },


    /**
     * Get the execution time.
     * @returns string  The time.
     */
    "time"(): string {
        return this.$store.state["time"].toString();
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when the user clicks the stdout download button.
     * @returns void
     */
    "stdOutDownload"(): void {
        var blob = new Blob([this["stdOut"]], { type: "text/plain;charset=utf-8" });
        saveBlob(blob, "stdout.txt");
    },

    /**
     * Runs when the user clicks the download output button.
     * @returns void
     */
    "fpocketOutputContentsDownload"(): void {
        var blob = new Blob([this["outputContents"]], { type: "text/plain;charset=utf-8" });
        saveBlob(blob, "protein_out.pdb");
    },
    /**
     * Runs when the user clicks the download zip button.
     * @returns void
     */
    "fpocketOutputZipDownload"(): void {
        // dynamic import JSZIP
        //@ts-ignore
        import(
            /* webpackChunkName: "JSZip" */
            /* webpackMode: "lazy" */
            "jszip"
        ).then(JSZip => {
            //@ts-ignore
            let zip = new JSZip.default();
            const nameTrimmed = this.$store.state["pdbFileNameTrimmed"];
            zip.folder("/" + nameTrimmed + "_out");
            zip.folder("/" + nameTrimmed + "_out/pockets");
            let protein_out = window["FS"]["readdir"]("/" + nameTrimmed + "_out");
            let pockets = window["FS"]["readdir"]("/" + nameTrimmed + "_out/pockets");
            for (let i = 3; i < protein_out.length; i++)
                zip.file("/" + nameTrimmed + "_out/" + protein_out[i], window["FS"]["readFile"]("/" + nameTrimmed + "_out/" + protein_out[i]));
            for (let i = 2; i < pockets.length; i++)
                zip.file("/" + nameTrimmed + "_out/pockets/" + pockets[i], window["FS"]["readFile"]("/" + nameTrimmed + "_out/pockets/" + pockets[i]));
            zip.generateAsync({ type: "blob" })
                .then(function (contentBlob) {
                    saveBlob(contentBlob, nameTrimmed + "_out.zip");
                });
        });
    },
}

/**
 * Setup the vina-output Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('fpocket-output', {
        "template": template,
        "props": {},
        "computed": computedFunctions,
        "watch": watchFunctions,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "selected": [],
            }
        },
        "methods": methodsFunctions
    })
}
