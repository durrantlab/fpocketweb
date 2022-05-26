// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


declare var Vue;

/** An object containing the vue-component watch functions. */
let watchFunctions = {
    /** Sets the fpocketParams object.  */
    "selected"(this) {
        this.$store.commit("setFpocketParam", {
            name: this["id"],
            val: this.selected
        });
    }
}

/** An object containing the vue-component method functions. */
let methodFunctions = {
    // TODO: JDD: I don't think this function is ever used. But pdbmine is
    // causing FS error.

    // "useExamplePDBInputFile"(): void {
    //     let miner = require('pdbmine');
    //     miner.query('ribozyme', function(result){
    //         console.log(result);
    //       });
    // }
}

/** An object containing the vue-component computed functions. */
let computedFunctions = {

    /**
     * Generates a description string.
     * @returns string  The description.
     */
    "desc"(): string {
        let toAdd = "";
        if ((this["required"] !== true) && (this["default"] === undefined)) {
            toAdd = " (Do not change to use default value.)";
        }
        return this["description"] + toAdd;
    },
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    // Always start by assuming it validates fine.
    if (this.$store.state["validation"][this["id"]] === undefined) {
        this.$store.commit("setValidationParam", {
            name: this["id"],
            val: !this["required"]
        });
    }

    // Set value if it is given.
    if (this["selected"] !== undefined) {
        this.$store.commit("setFpocketParam", {
            name: this["id"],
            val: this["default"]
        });
    }
}

/**
 * Setup the numeric-input Vue commponent.
 * @returns void
 */
export function setup(): void {
    // TODO: JDD: I don't think this function is ever used. But pdbmine is
    // causing FS error.

    // Vue.component('download-example', {
    //     /**
    //      * Get the data associated with this component.
    //      * @returns any  The data.
    //      */
    //     "data": function () {
    //         return {
    //             "invalidMsg": "This field is required.",
    //             "action": "Change"
    //         }
    //     },
    //     "computed": computedFunctions,
    //     "watch": watchFunctions,
    //     "methods": methodFunctions,
    //     "template": `
    //         <form-group
    //             :label="label"
    //             :id="'input-group-' + id"
    //             :style="styl"
    //             :description="desc"
    //             :formGroupWrapper="formGroupWrapper"
    //         >

    //             <div>
    //             <form-button @click.native="useExamplePDBInputFile" cls="float-right">Use Example Files</form-button>
    //             </div>
    //         </form-group>
    //     `,
    //     "props": {
    //         "selected": null,
    //         "label": String,
    //         "id": String,
    //         "description": String,
    //         "placeholder": String,
    //         "required": Boolean,
    //         "styl": String,
    //         "options": {
    //             type: Array,
    //             required: true,
    //             validator(opts) {
    //                 return !opts.find(opt => typeof opt !== 'object');
    //             }
    //         },
    //         "formGroupWrapper": {
    //             "type": Boolean,
    //             "default": true
    //         }
    //     },

    //     /**
    //      * Runs when the vue component is mounted.
    //      * @returns void
    //      */
    //     "mounted": mountedFunction
    // })
}
