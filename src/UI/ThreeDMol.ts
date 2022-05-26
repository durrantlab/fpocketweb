// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

declare var $3Dmol;

declare var Vue;

let bigMolAlreadyModalDisplayed = false;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Get the value of the pdbContents variable.
     * @returns string  The value.
     */
    "pdbContents"(): string {
        return this.$store.state["pdbContents"];
    },
    /**
     * Get the value of the pocketsContents variable
     */
    "pocketsContents"(): any {
        return JSON.parse(this.$store.state["pocketsContents"]);
    },
    /**
     * Get the value of the pocketsToRender variable
     */
    "pocketsToRender"(): any {
        return this.$store.state["pocketsToRender"];
    },
    /**
     * Get the value of the oldPocketsToRender variable
     */
    "pocketsToRemove"(): any {
        return this.$store.state["pocketsToRemove"];
    },
    /**
     * Get the value of the pocketsColors variable
     */
    "pocketsColors"(): any {
        return JSON.parse(this.$store.state["pocketsColors"]);
    },
    /**
     * Get the value of the pocketsOpacity variable
    */
    "pocketsOpacity"(): any {
        return JSON.parse(this.$store.state["pocketsOpacity"]);
    },
    /** Get the value of the vinaParams variable.
     * @returns string  The value.
     */
    fpocketParams(): string {
        return this.$store.state["fpocketParams"];
    },

    /**
     * Get the value of the surfBtnVariant variable.
     * @returns string|boolean  The value.
     */
    "surfBtnVariant"(): string | boolean {
        return (this["renderProteinSurface"] === true) ? undefined : "default";
    },

    /**
     * Get the value of the allAtmBtnVariant variable.
     * @returns string|boolean  The value.
     */
    "allAtmBtnVariant"(): string | boolean {
        return (this["renderProteinSticks"] === true) ? undefined : "default";
    },

    /**
     * Get the value of the crystalBtnVariant variable.
     * @returns string|boolean  The value.
     */
    "crystalBtnVariant"(): string | boolean {
        return (this["renderCrystal"] === true) ? undefined : "default";
    },

    /**
     * Determines whether the appropriate PDB content has been loaded.
     * @returns boolean  True if it has been loaded, false otherwise.
     */
    "appropriatePdbLoaded"(): boolean {
        return this.$store.state["pdbContents"] !== "";
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when a new model has been added.
     * @param  {number} duration  How long to wait before adding that
     *                            model to 3dmol.js widget.
     * @returns void
     */
    modelAdded(duration: number): void {
        // First, check to make sure the added model is relevant to
        // this 3dmoljs instance.
        if (this["appropriatePdbLoaded"] === false) {
            return;
        }

        // Put app into waiting state.
        jQuery("body").addClass("waiting");
        this["msg"] = "Loading...";

        setTimeout(() => {
            // Initialize the viewer if necessary.
            if (this["viewer"] === undefined) {
                let element = jQuery("#" + this["type"] + "-3dmol");
                let config = {
                    "backgroundColor": "white"
                };
                this["viewer"] = $3Dmol.createViewer(element, config);
            }

            let loadPDBTxt = (typeStr: string, callBack: any) => {
                if (typeStr === "pockets") {
                    const pocketsToRender = this.pocketsToRender;
                    const pocketsContents = this.pocketsContents;
                    const pocketsColors = this.pocketsColors;
                    const pocketsOpacity = this.pocketsOpacity;

                    for (let i = 0; i < pocketsToRender.length; i++) {
                        const pocketIdx = pocketsToRender[i];
                        const pdb = pocketsContents[pocketIdx];
                        let mdl = this["viewer"].addModel(pdb, "pdb", { "keepH": true });
                        
                        // When you load the model (pocket), line representation
                        // is the default. Clear that first.
                        mdl.setStyle({}, {});

                        //mdl.setStyle({ "sphere": { "color": pocketsColors[pocketIdx] } });
                        let srf = this["viewer"].addSurface(
                            $3Dmol.SurfaceType.MS, {
                            "color": pocketsColors[pocketIdx],
                            "opacity": pocketsOpacity[pocketIdx]
                        },
                            {
                                "model": mdl
                            }
                        );
                        this["pocketsSrfObj"][pocketIdx] = srf.surfid;
                        console.log("%cAdding: ", 'background: blue; color: white; font-size: 2em;', pocketIdx)
                        this[typeStr + "Mol"][pocketIdx] = mdl;  // JDD: Because an object now.

                        // JDD: Callback wasn't called here, so 3dmoljs never
                        // told about change. Added below, which calls
                        // callback once for each pocket.
                        callBack(mdl);
                    }
                } else {
                    // TODO: refactor this! Leftovers of pdbx->pdb convertion
                    let origPDBContent = this[typeStr + "Contents"];
                    let pdb = origPDBContent;
                    if (pdb !== "") {
                        if (this[typeStr + "PdbOfLoaded"] !== pdb) {
                            console.log(this["type"], "Adding " + typeStr, pdb.length);
                            this[typeStr + "PdbOfLoaded"] = pdb;

                            this["viewer"].removeModel(this[typeStr + "Mol"]);
                            this["viewer"].resize();

                            this[typeStr + "Mol"] = this["viewer"].addModel(pdb, "pdb", { "keepH": true });
                            modelForZooming = this[typeStr + "Mol"];

                            callBack(modelForZooming);
                        }
                    } else if (origPDBContent !== "") {
                        // It's empty, but shouldn't be. Probably not
                        // properly formed.

                        // this["viewer"].removeModel(this[typeStr + "Mol"]);
                        // this["viewer"].removeAllShapes();
                        // this["viewer"].resize();

                        this.$store.commit("openModal", {
                            title: "Invalid Input File!",
                            body: "<p>The selected input file is not properly formatted. The molecular viewer has not been updated. Please select a properly formatted PDB file.</p>"
                        });
                    }
                }
            }

            // Convert pdbqt to pdb
            // TODO : maybe the condition is not necessary at all ?! REFACTOR THIS!!!
            let modelForZooming: any;
            //if (["pdb", "pockets"].indexOf(this["type"]) !== -1) {
            if (["pdb"].indexOf(this["type"]) !== -1) {
                var somethingChanged;
                loadPDBTxt("pdb", (mol) => {
                    somethingChanged = true;
                    //this["viewer"].removeAllSurfaces();
                    this["surfaceObj"] = undefined;

                    // this["renderProteinSurface"] = false;

                    this.pdbAdded(mol);
                });
            }

            if (["pockets"].indexOf(this["type"]) !== -1) {

                loadPDBTxt("pockets", (mol) => {
                    if (mol !== undefined) {
                        // JDD: Need to check for undefined because there
                        // could be no pockets yet specified.

                        // JDD: Commented out below so no zoom to pocket.
                        // Better to have whole-protein view, I think, but I'm
                        // not 100% sure.
                        // somethingChanged = true;
                        this.pocketsAdded(mol);
                    }
                });

                loadPDBTxt("pdb", (mol) => {
                    somethingChanged = true;
                    this["viewer"].removeAllSurfaces();
                    this["surfaceObj"] = undefined;

                    // this["renderProteinSurface"] = false;

                    this.pdbAdded(mol);
                });
            }

            if (somethingChanged === true) {
                // this["viewer"].resize();  // To make sure. Had some problems in testing.
                this["viewer"].render();
                this["viewer"].zoomTo({ "model": modelForZooming }, duration);
                this["viewer"].zoom(0.8, duration);
            }


            // Stop waiting state.
            jQuery("body").removeClass("waiting");
        }, 50);

    },

    /**
     * Runs when a pdb has been added.
     * @param  {any} mol  The 3dmol.js molecule object.
     * @returns void
     */
    pdbAdded(mol: any): void {
        // Make the atoms of the protein clickable if it is receptor.
        if (this["type"] === "pdb") {
            this.makeAtomsClickable(mol);
        }

        this.showSurfaceAsAppropriate();
        this.showSticksAsAppropriate();
    },

    /**
     * Runs when a pockets have been added.
     * @param  {any} mol  The 3dmol.js molecule object.
     * @returns void
     */
    pocketsAdded(mol): void {
        this["viewer"]["render"]();
    },

    /**
     * Makes the atoms of a 3dmol.js molecule clicable.
     * @param  {any} mol  The 3dmol.js molecule.
     * @returns void
     */
    makeAtomsClickable(mol: any): void {
        mol.setClickable({}, true, (e) => {
            /*
            this.$store.commit("setFpocketParam", {
                name: "center_x",
                val: e["x"]
            });
            this.$store.commit("setFpocketParam", {
                name: "center_y",
                val: e["y"]
            });
            this.$store.commit("setFpocketParam", {
                name: "center_z",
                val: e["z"]
            });
            */
        });

        // Also make labels.
        var atoms = mol.selectedAtoms({});
        let len = atoms.length;
        for (var i = 0; i < len; i++) {
            let atom = atoms[i];
            this["viewer"].setHoverable({}, true, (atom: any) => {
                let lbl = atom["resn"].trim() + atom["resi"].toString() + ":" + atom["atom"].trim();
                atom["chain"] = atom["chain"].trim();
                if (atom["chain"] !== "") {
                    lbl += ":" + atom["chain"];
                }
                this["viewer"].addLabel(lbl, { "position": atom, "backgroundOpacity": 0.8 });
            }, (atom: any) => {
                this["viewer"].removeAllLabels();
                
            })
        }
    },

    /**
     * Sets a fpocket parameter only if it is currently undefined. Used
     * for setting default values, I think.
     * @param  {string} name  The variable name.
     * @param  {any}    val   The value.
     * @returns void
     */
    setFpocketParamIfUndefined(name: string, val: any): void {
        if (this.$store.state["fpocketParams"][name] === undefined) {
            this.$store.commit("setFpocketParam", {
                name,
                val
            });
            this.$store.commit("setValidationParam", {
                name,
                val: true
            })
        }
    },

    /**
     * Show a molecular surface representation if it is appropriate
     * given user settings.
     * @returns void
     */
    showSurfaceAsAppropriate(): void {
        // If no protein has been loaded, no need to proceed.
        if (this["pdbMol"] === undefined) {
            return;
        }

        if (this["renderProteinSurface"] === true) {
            // You're supposed to render the surface. What if it
            // doesn't exist yet?
            if (this["surfaceObj"] === undefined) {
                this["viewer"].removeAllSurfaces();
                this["surfaceObj"] = this["viewer"].addSurface(
                    $3Dmol.SurfaceType.MS, {
                    "color": 'white',
                    "opacity": 0.85
                },
                    {
                        "model": this["pdbMol"]
                    }
                );
            }

            // Now it exists for sure. Make sure it is visible.
            this["viewer"]["setSurfaceMaterialStyle"](
                this["surfaceObj"]["surfid"],
                {
                    "color": 'white',
                    "opacity": 0.85
                }
            )
            this["viewer"]["render"]();
        } else {
            // So you need to hide the surface, if it exists.
            if (this["surfaceObj"] !== undefined) {
                this["viewer"]["setSurfaceMaterialStyle"](
                    this["surfaceObj"]["surfid"],
                    { "opacity": 0 }
                );
                this["viewer"]["render"]();
            }
        }
    },

    /**
     * Show a sticks representation if it is appropriate given user
     * settings.
     * @returns void
     */
    showSticksAsAppropriate(): void {
        // If no protein has been loaded, no need to proceed.
        if (this["pdbMol"] === undefined) {
            return;
        }

        if (this["renderProteinSticks"] === true) {
            // Set up the style.
            this["pdbMol"].setStyle(
                {},
                {
                    "stick": { "radius": 0.15 },
                    "cartoon": { "color": 'spectrum' },
                }
            );
            this["viewer"]["render"]();
        } else {
            // Set up the style.
            this["pdbMol"].setStyle({}, {});  // This is better. Clear first.
            this["viewer"]["render"]();
            this["pdbMol"].setStyle(
                {},
                { "cartoon": { "color": 'spectrum' } }
            );
            this["viewer"]["render"]();
        }
    },

    /**
     * Show a yellow sticks representation if it is appropriate given
     * user settings.
     * @returns void
     */
    showCrystalAsAppropriate(): void {
        // If no protein has been loaded, no need to proceed.
        if (this["crystalMol"] === undefined) {
            return;
        }

        if (this["renderCrystal"] === true) {
            // Set up the style.
            this["crystalMol"].setStyle(
                {},
                {
                    "stick": {
                        "radius": 0.3,
                        "color": "yellow"
                        // "colorscheme": "yellowCarbon"
                    }
                }
            );
            this["viewer"]["render"]();
        } else {
            // Set up the style.
            this["crystalMol"].setStyle({}, {});
            this["viewer"]["render"]();
        }
    },

    /**
     * Toggles the surface representation on and off.
     * @returns void
     */
    "toggleSurface"(): void {
        this["renderProteinSurface"] = !this["renderProteinSurface"];
        this.showSurfaceAsAppropriate();
    },

    /**
     * Toggles the sricks representation on and off.
     * @returns void
     */
    "toggleSticks"(): void {
        this["renderProteinSticks"] = !this["renderProteinSticks"];
        this.showSticksAsAppropriate();
    },

    /**
     * Toggles the yellow sticks representation on and off.
     * @returns void
     */
    "toggleCrystal"(): void {
        this["renderCrystal"] = !this["renderCrystal"];
        this.showCrystalAsAppropriate();
    },
}

/** An object containing the vue-component watch functions. */
let watchFunctions = {
    /**
     * Watch when the pdbContents computed property.
     * @param  {string} oldPdbContents  The old value of the property.
     * @param  {string} newPdbContents  The new value of the property.
     * @returns void
     */
    "pdbContents": function (oldPdbContents: string, newPdbContents: string): void {
        // The purpose of this is to react when new pdbContents
        // are added.

        let duration: number = (newPdbContents === "") ? 0 : 500;
        this.modelAdded(duration);
    },

    "pocketsColors": function (newColors: any, oldColors: any): void {
        // The purpose of this is to react when user changed color of a pocket
        for (let i in oldColors)
            if (oldColors[i] !== newColors[i])
                if (this["pocketsMol"][i] !== undefined) {
                    let srf = this["pocketsSrfObj"][i];
                    this["viewer"]["setSurfaceMaterialStyle"](srf, { "color": newColors[i] });
                    this["viewer"]["render"]();
                    window["viewer"] = this["viewer"];
                    window["pocketMol"] = this["pocketsMol"]
                }
    },
    "pocketsOpacity": function (newOpacity: any, oldOpacity: any): void {
        // The purpose of this is to react when user changed opacity of a pocket
        for (let i in oldOpacity)
            if (oldOpacity[i] !== newOpacity[i])
                if (this["pocketsMol"][i] !== undefined) {
                    let srf = this["pocketsSrfObj"][i];
                    this["viewer"]["setSurfaceMaterialStyle"](srf, { "opacity": newOpacity[i] });
                    this["viewer"]["render"]();
                    window["viewer"] = this["viewer"];
                    window["pocketMol"] = this["pocketsMol"]
                }
    },
    "pocketsToRemove": function (): void {
        // The purpose of this is to react when new elements of pocketsToRemove are marked for removal.
        if (Object.keys(this["pocketsSrfObj"]).length === 0)
            return;
        const pocketsToRemove = this.pocketsToRemove;
        for (let i = 0; i < pocketsToRemove.length; i++) {
            const idxToRemove = pocketsToRemove[i];
            console.log("%cRemoving: ", 'background: red; color: white; font-size: 2em;', idxToRemove)
            this["viewer"]["removeSurface"](this["pocketsSrfObj"][idxToRemove]);
            this["viewer"]["render"]();
            window["viewer"] = this["viewer"];
            window["pocketMol"] = this["pocketsMol"]
        }
    },
    "pocketsToRender": function (newPocketsToRender: any, oldPocketsToRender: any): void {
        // The purpose of this is to react when new elements of pocketsToRender are added.
        const pocketsToRender = this.pocketsToRender;
        // Load pocket PDB file from virtual file system if necessary.
        let tmp = this.pocketsContents;
        for (let i = 0; i < pocketsToRender.length; i++)
            if (!tmp[pocketsToRender[i]]) {
                const pdbBaseNameTrimmed = window["store"]["state"]['pdbFileNameTrimmed'];
                const ind = pocketsToRender[i];
                const fileContents = new TextDecoder().decode(window["FS"]["readFile"]("/" + pdbBaseNameTrimmed + "_out/pockets/pocket" + pocketsToRender[i] + "_atm.pdb"));
                tmp[ind] = fileContents;
            }
        // Update pocketsContents.
        this.$store.commit("setVar", {
            name: "pocketsContents",
            val: JSON.stringify(tmp)
        });

        // Tell the viewer to render the models
        // TODO refactor this!
        //let duration: number = (newPocketsContents === "") ? 0 : 500;
        let duration = 500;
        this.modelAdded(duration);

    },

    fpocketParams(oldFpocketParams: string, newFpocketParams: string): void {
        // For updating the docking box...
        if (this["type"] !== "pdb") {
            return;
        }

        //this.updateBox();
    }
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    this["renderProteinSurface"] = this["proteinSurface"];
}

/**
 * Setup the threedmol Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('threedmol', {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "viewer": undefined,
                "surfaceObj": undefined,
                "pocketsSrfObj": {},
                "pdbMol": undefined,
                "pocketsMol": {},  // JDD: Made an object, not list. Will map index to mol object.
                "pockets": undefined,
                "crystalMol": undefined,
                "pocketsPdbOfLoaded": "",  // To prevent from loading twice.
                "renderProteinSurface": undefined,
                "renderProteinSticks": false,
                "renderCrystal": true,
                "msg": "Use the file input above to select the " + this["type"].toUpperCase() + " file."
            }
        },
        "computed": computedFunctions,
        "template": `
            <div class="container-3dmol" style="display:grid;">
                <div
                    :id="type + '-3dmol'"
                    style="height: 400px; width: 100%; position: relative;">

                    <b-card v-if="!appropriatePdbLoaded"
                        class="text-center"
                        :title="'Missing ' + type.toUpperCase() + ' File'"
                        style="width: 100%; height: 100%;"
                    >
                        <b-card-text v-if="autoLoad">
                            Loading...
                        </b-card-text>
                        <b-card-text v-else>
                            {{msg}}
                        </b-card-text>
                    </b-card>
                    <b-card v-else
                        class="text-center"
                        :title="'Missing ' + type.toUpperCase()"
                        style="width: 100%; height: 100%;"
                    >
                        Currently loading...
                    </b-card>
                </div>
                <div v-if="type!=='ligand'" style="margin-top:-34px; padding-right:9px;" class="mr-1">
                    <!-- <form-button :variant="surfBtnVariant" @click.native="toggleSurface" :small="true">Surface</form-button> -->
                    <form-button :variant="allAtmBtnVariant" @click.native="toggleSticks" :small="true">All Atoms</form-button>
                </div>
            </div>
        `,
        "watch": watchFunctions,
        "props": {
            "type": String, // receptor, ligand, or pockets. Used only to
            // determine if it's been loaded yet.
            "proteinSurface": {
                "type": Boolean,
                "default": false
            },
            "autoLoad": {
                "type": Boolean,
                "default": false
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
