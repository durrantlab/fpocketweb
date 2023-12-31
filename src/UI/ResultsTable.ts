// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


declare var Vue;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Gets the items in the results table.
     * @returns any[]  The array of items.
     */
    "items"(): any[] {
        let data = this.$store.state["pdbOutputFrames"];
        const dataLen = data.length;
        let items = [];
        let errorDetected = false;
        for (let i = 0; i < dataLen; i++) {
            const dataItem = data[i][0];  // The info about RMSD and such.
            if (dataItem !== undefined) {
                items.push({
                    "mode": dataItem[0],
                    "affinity (kcal/mol)": dataItem[1],
                    "dist from rmsd L.B.": dataItem[2],
                    "dist from rmsd U.B.": dataItem[3]
                });
            } else {
                // The pdbqt didn't have this meta information.
                errorDetected = true;
                items.push({
                    "mode": "---",
                    "affinity (kcal/mol)": "---",
                    "dist from rmsd L.B.": "---",
                    "dist from rmsd U.B.": "---",
                });
            }
        }
        if (errorDetected === true) {
            this.$store.commit("openModal", {
                title: "Output File Invalid!",
                body: "<p>The output PDBQT file does not appear to be properly formatted.</p>"
            });
        }
        return items;
    },

    /**
     * Get's the field descriptions of each item in the results list.
     * @returns any[]  A list of the field descriptions.
     */
    "fields"(): any[] {
        return [
            {
                "key": "mode"
            },
            {
                "key": "affinity (kcal/mol)"
            },
            {
                "key": "dist from rmsd L.B."
            },
            {
                "key": "dist from rmsd U.B."
            }
        ];
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when the table row is clicked. Updates visualization.
     * @param  {any}    data  Not used.
     * @param  {number} idx   The index of the clicked row.
     * @returns void
     */
    "rowClicked"(data: any, idx: number): void {
        let ligPDBTxt = this.$store.state["pdbOutputFrames"][idx][1];
        this.$store.commit("setVar", {
            name: "dockedContents",
            val: ligPDBTxt
        });
    }
}

/**
 * Setup the results-table Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('results-table', {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data": function() {
            return {
            }
        },
        "computed": computedFunctions,
        "template": `
            <b-table
                striped hover small
                :items="items"
                :fields="fields"
                @row-clicked="rowClicked">
            </b-table>
        `,
        "props": {},
        "methods": methodsFunctions
    })
}
