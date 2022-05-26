// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


declare var Vue;

//@ts-ignore
import template from "./templates/infotable.htm";
//@ts-ignore
import InputColorPicker from "vue-native-color-picker";
//@ts-ignore
import VueSlider from 'vue-slider-component';
//@ts-ignore
import 'vue-slider-component/theme/antd.css';

/** An object containing the vue-component computed functions. */
let computedFunctions = {

    "rows"(): number {
        return this.items.length
    },
    /**
     * Gets the items in the results table.
     * @returns any[]  The array of items.
     */
    "items"(): any[] {
        let errorDetected = false;
        let items = [];
        if (this.$store.state["infoFile"]) {
            const pdbBaseNameTrimmed = window["store"]["state"]['pdbFileNameTrimmed'];
            let pocketTxt = new TextDecoder("utf-8").decode(
                window["FS"]["readFile"]('/' + pdbBaseNameTrimmed + '_out/' + pdbBaseNameTrimmed + '_info.txt')
            );

            const data = pocketTxt.split("\n\n");
            for (let i = 0; i < data.length; i++) {
                const tmp = data[i].split("\n");
                if (tmp.length > 1) {
                    items.push({
                        'pocket': i + 1,  // Leave lower case
                        'Score': tmp[1].split(":")[1],
                        'Druggability score': tmp[2].split(":")[1],
                        'Number of alpha spheres': tmp[3].split(":")[1],
                        'Total SASA': tmp[4].split(":")[1],
                        'Polar SASA': tmp[5].split(":")[1],
                        'Apolar SASA': tmp[6].split(":")[1],
                        'Volume': tmp[7].split(":")[1],
                        'Mean local hydrophobic density': tmp[8].split(":")[1],
                        'Mean alpha sphere radius': tmp[9].split(":")[1],
                        'Mean alpha sphere solvent access': tmp[10].split(":")[1],
                        'Apolar alpha sphere proportion': tmp[11].split(":")[1],
                        'Hydrophobicity score': tmp[12].split(":")[1],
                        'Volume score': tmp[13].split(":")[1],
                        'Polarity score': tmp[14].split(":")[1],
                        'Charge score': tmp[15].split(":")[1],
                        'Proportion of polar atoms': tmp[16].split(":")[1],
                        'Alpha sphere density': tmp[17].split(":")[1],
                        'Center of mass, alpha sphere max distance': tmp[18].split(":")[1],
                        'Flexibility': tmp[19].split(":")[1]
                    });
                    this.colors[i] = this.generateRandomColor();
                    console.log("Generating color #" + i + 1);
                    this.opacities[i + 1] = 0.85;
                }
            }
            this.setColorsStoreVar();
            this.setOpacity();
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
                key: 'pocket',
                label: 'Pocket #',
                sortable: false
            },
            {
                key: 'color',
                label: 'Display Color',
                sortable: false
            },
            {
                //key: 'opacity',
                //label: 'Opacity',
                //sortable: false
            },
            {
                key: 'Score',
                sortable: true,
                variant: 'active'
            },
            {
                key: 'Druggability score',
                sortable: true
            },
            {
                key: 'Number of alpha spheres',
                sortable: true
            },
            {
                key: 'Volume',
                sortable: true
            },
            {
                key: 'details',
                label: 'Show Details'
            }
        ];
    },
    "allRowsSelectedVariant"(): string | boolean {
        return (this.selected.length === this.items.length) ? undefined : "default"
    },
    "noRowsSelectedVariant"(): string | boolean {
        return (this.selected.length === 0) ? undefined : "default"
    },

}

/**
 * An object containing the vue-component watch functions
 */
let watchFunctions = {
    /**
     * Watch when the items computed property.
     * @returns void
     * The timeout is to let vue first render the table;otherwise selectRow is ignored
     */
    "items"(): void {
        setTimeout(() => { this.$refs.infoOutput.selectRow(0); }, 300);
    },
    /**
     * Watch when the selected data property.
     * @returns void
     * Sets the store var for 3dmoljs renderer.
     */
    "selected"(newSelected: any, oldSelected: any): void {
        // setting the store variable for displaying (or not) SubPex config later on

        this.$store.commit("setVar", {
            name: "infoTableOnlyOneLineSelected",
            val: newSelected.length === 1
        });
        if (newSelected[0])
            this.$store.commit("setVar", {
                name: "infoTableSelectedLine",
                val: newSelected[0]['pocket']
            });

        let pocketsToRemove = oldSelected.filter(function (x) {
            // checking second array does not contain element "x"
            if (newSelected.indexOf(x) == -1)
                return true;
            else
                return false;
        });

        let tmp = [];
        for (let i = 0; i < pocketsToRemove.length; i++)
            tmp.push(pocketsToRemove[i]['pocket']);
        this.$store.commit("setVar", {
            name: "pocketsToRemove",
            val: tmp
        });

        let pocketsToRender = newSelected.filter(function (x) {
            // checking second array does not contain element "x"
            if (oldSelected.indexOf(x) == -1)
                return true;
            else
                return false;
        });
        tmp = [];
        for (let i = 0; i < pocketsToRender.length; i++)
            tmp.push(pocketsToRender[i]['pocket']);
        this.$store.commit("setVar", {
            name: "pocketsToRender",
            val: tmp
        });
    },
    "colors"(): void {
        this.setColorsStoreVar();
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when the table row is selected. Updates visualization.
     * @param  {any}    items  The list of selected rows.
     * @returns void
     */

    "onRowSelected"(items: any): void {
        this.selected = items;
    },
    "selectAll"(): void {
        /**
         * Runs when all rows are chosen for selection
         */
        this.$refs.infoOutput.selectAllRows();
    },
    "clearSelection"(): void {
        /**
     * Runs when clear Selection btn is pressed
     */
        this.$refs.infoOutput.clearSelected();
    },
    /**
     * Helper method to generate random colors
     */
    "generateRandomColor"(): string {
        let color = '#';
        for (let i = 0; i < 6; i++) {
            const random = Math.random();
            const bit = (random * 16) | 0;
            color += (bit).toString(16);
        };
        return color;
    },
    /**
     * TODO refactor this!!!
     */
    "setColorsStoreVar"(): void {
        this.$store.commit("setVar", {
            name: "pocketsColors",
            val: JSON.stringify(this.colors)
        });
    },
    "setOp"(idx: any): void {
        let val = this.$refs.slider.getValue()
        Vue.set(this.opacities, idx, val);
        this.setOpacity();
    },
    "setOpacity"(): void {
        this.$store.commit("setVar", {
            name: "pocketsOpacity",
            val: JSON.stringify(this.opacities)
        });
    },
}

/**
 * Setup the info-table Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('info-table', {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data": function () {
            return {
                "selected": [],
                "transProps": {
                    // Transition name
                    name: 'flip-list'
                },
                "colors": {},
                "opacities": {},
                "value": 0.85,
                "sliderMin": 0,
                "sliderMax": 1,
                "sliderInterval": 0.01,
                "perPage": 10,
                "currentPage": 1,
            }
        },
        "components": {
            "v-input-colorpicker": InputColorPicker,
            "VueSlider": VueSlider
        },
        "computed": computedFunctions,
        "template": template,
        "props": {},
        "methods": methodsFunctions,
        "watch": watchFunctions
    })
}
