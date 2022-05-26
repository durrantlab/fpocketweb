// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2022
// Jacob D. Durrant.

import { fetchError, loadRemote } from "../../../Common/Utils";
import { commonFileLoaderProps } from "../../../Common/CommonProps.VueFuncs";
import { FileLoaderPluginParent } from "./PluginParent/PluginParent";

export class AlphaFoldInputPlugin extends FileLoaderPluginParent {
    tag = "alphafold-input";
    tabName = "AF";
    defaultPlaceHolder = "AlphaFold: Type the UniProt accession...";
    
    /**
     * How to clear the entry after a file has loaded.
     */    
    clearEntryAfterLoad = function(): void {
        this["val"] = "";
    }

    template = /*html*/ `
        <file-loader-text-input
            v-model="val"
            ref="textInput"
            :placeholder="placeholder"
            :formatter="formatter"
            @onLoad="loadAlphaFold"
            :btnDisabledFunc="btnDisabledFunc"
            :valid="valid"
        >
        </file-loader-text-input>`;
    
    data = function() {
        return {
            "val": ""
        };
    }

    methods = {
        /**
         * Loads a PDB file from the alphafold database
         * @param {string} uniprot The UNIPROT accession
         */
        "loadAlphaFold"(uniprot: string): void {
            let url = `https://alphafold.ebi.ac.uk/api/prediction/${uniprot.toUpperCase()}`;
            
            // Fetch json about the alpha fold PDB from uniprot
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    let pdbUrl = json[0]["pdbUrl"];  // TODO: When would there be multiple entreis?
                    if (pdbUrl) {
                        // Load the PDB file.
                        loadRemote(pdbUrl, this).then((success) => {});
                    }
                })
                .catch((err) => {
                    err.message = `Error loading data. Is your UniProt accession correct?`;
                    fetchError(err, url, this);
                })
        },

        /**
         * Enforces UniProt accession formatting
         * @param {string} text  The UniProt accession.
         * @returns The reformatted UniProt accession.
         */
        "formatter"(text: string): string {
            // https://www.uniprot.org/help/accession_numbers
            text = text.toUpperCase();

            // Keep only capital letters and nubmers
            text = text.replace(/[^A-Z0-9]/g, "");

            text = text.slice(0, 10);
            return text;
        },

        /**
         * If text is a properly formatted UniProt accession, enable the button.
         * Otherwise, disabled.
         * @param {string} text  The text to evaluate.
         * @returns A boolean value, whether to disable the button.
         */
        "btnDisabledFunc"(text: string): boolean {
            // // https://www.uniprot.org/help/accession_numbers
            let r = /[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}/;
            
            // Return bool whether text matches regex
            return !text.match(r);
        }
    };
    
    props = {
        ...commonFileLoaderProps,
    };
}
