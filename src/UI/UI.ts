// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


import * as Store from "../Vue/Store";
import * as Utils from "../Utils";
import { VERSION } from "../Version";

declare var Vue;

Vue.config.devtools = true;

/**
 * Setup the main Vue app.
 * @returns void
 */
export function setup(): void {
    new Vue({
        "el": '#app',
        "store": Store.store,
        "template": /*html*/ `
            <div class="container-fluid">
                <open-modal></open-modal>
                <!-- <div id="no-mobile">
                    <b-jumbotron class="jumbo" header="FPocketWeb ${VERSION}" lead="AutoDock Vina Ported to WebAssembly">
                        <p>FPocketWeb ${VERSION} is not designed to work on mobile phones. Please use a device with a larger screen.</p>
                    </b-jumbotron>
                </div> -->

                <b-jumbotron class="jumbo" style="background-image:url(${Utils.curPath()}webina_logo.jpg);" header="FPocketWeb ${VERSION}" lead="Fpocket Ported to WebAssembly">
                    <p style="margin-top:-15px;">
                        Brought to you by the <a target="_blank" href="http://durrantlab.com">Durrant Lab</a> and
                        <a target="_blank" href="https://reporter.nih.gov/search/McHBj_PFF0elQMu9OJ2AlQ/project-details/10189658">NIH R01GM132353</a>.
                        Please cite the <a target="_blank" href="#">FPocketWeb</a> and <a target="_blank" href="https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-10-168"><i>fpocket</i></a> manuscripts.
                        License: <a target="_blank" href="https://opensource.org/licenses/Apache-2.0">Apache 2.0.</a>
                    </p>
                    <b-button variant="primary" target="_blank" href="http://durrantlab.com">More Info</b-button>
                </b-jumbotron>

                <b-card no-body class="mb-3">
                    <b-tabs v-model="tabIdx" card fill pills vertical class="tab-container" content-class="mt-3 force-reflow"> <!-- vertical -->
                        <b-tab title="Input Parameters" active :disabled="parametersTabDisabled">
                            <b-card-text>
                                <fpocket-params></fpocket-params>
                            </b-card-text>
                        </b-tab>
                        <b-tab title="Running FPocketWeb" :disabled="runningTabDisabled">
                            <b-card-text>
                                <fpocket-running></fpocket-running>
                            </b-card-text>
                        </b-tab>
                        <b-tab title="Output" :disabled="outputTabDisabled">
                            <b-card-text>
                                <fpocket-output></fpocket-output>
                            </b-card-text>
                        </b-tab>
                        <b-tab title="Start Over" :disabled="startOverTabDisabled">
                            <b-card-text>
                                <start-over></start-over>
                            </b-card-text>
                        </b-tab>
                    </b-tabs>
                </b-card>
            </div>
        `,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "pdbFile": false
            }
        },
        "computed": {
            /** Gets and sets the tabIdx. */
            "tabIdx": {
                get(): number {
                    return this.$store.state["tabIdx"];
                },

                set(val: number): void {
                    this.$store.commit("setVar", {
                        name: "tabIdx",
                        val: val
                    });
                }
            },

            /**
             * Determine whether the parameters tab is disabled.
             * @returns boolean  True if it is disabled, false otherwise.
             */
            "parametersTabDisabled"(): boolean {
                return this.$store.state["parametersTabDisabled"];
            },

            /**
             * Determine whether the running tab is disabled.
             * @returns boolean  True if it is disabled, false otherwise.
             */
            "runningTabDisabled"(): boolean {
                return this.$store.state["runningTabDisabled"];
            },

            /**
             * Determine whether the output tab is disabled.
             * @returns boolean  True if it is disabled, false otherwise.
             */
            "outputTabDisabled"(): boolean {
                return this.$store.state["outputTabDisabled"];
            },

            /**
             * Determine whether the existing vina output tab is disabled.
             * @returns boolean  True if it is disabled, false otherwise.
             */
            "existingFpocketOutputTabDisabled"(): boolean {
                return this.$store.state["existingFPocketOutputTabDisabled"];
            },

            /**
             * Determine whether the start over tab is disabled.
             * @returns boolean  True if it is disabled, false otherwise.
             */
            "startOverTabDisabled"(): boolean {
                return this.$store.state["startOverTabDisabled"];
            }
        },

        "methods": {},

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted"() {
            // window["$store"] = this.$store;  // For debugging
        }
    })
}
