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
  "cfgStr"(): string {
    // sanity check - if only one pocket is set to render
    if (this.displayConfig) {

      if (this.$store.state["infoFile"]) {
        const pocket0 = new TextDecoder("utf-8").decode(
          window["FS"]["readFile"]('/' + window["store"]["state"]['pdbFileNameTrimmed'] + '_out/pockets/pocket' + window["store"]["state"]["infoTableSelectedLine"] + '_vert.pqr')
        );
        const re = /(?:ATOM)(.*)/g;
        let x_av = 0;
        let y_av = 0;
        let z_av = 0;
        let coords = [];
        let rad = 0;

        if (pocket0) {
          let lines = pocket0.split('\n');
          for (let line = 0; line < lines.length; line++) {
            const match = re.exec(lines[line]);
            if (match) {
              const coordsTxt = match[1].replace(/\s+/g, ' ').trim().split(' ');
              /* 
              
      \s: matches any whitespace symbol: spaces, tabs, and line breaks
      +: match one or more of the preceding tokens (referencing \s)
      g: the g at the end indicates iterative searching throughout the full string
  
              */
              const x_tmp = Number(coordsTxt[4]);
              const y_tmp = Number(coordsTxt[5]);
              const z_tmp = Number(coordsTxt[6]);
              coords.push([x_tmp, y_tmp, z_tmp]);
              x_av += x_tmp;
              y_av += y_tmp;
              z_av += z_tmp;
            }
          }
          x_av = x_av / lines.length;
          y_av = y_av / lines.length;
          z_av = z_av / lines.length;
          for (let i = 0; i < coords.length; i++) {
            if (this.distanceVector(x_av, coords[i][0], y_av, coords[i][1], z_av, coords[i][2]) > rad) {
              rad = this.distanceVector(x_av, coords[i][0], y_av, coords[i][1], z_av, coords[i][2]);
            }
          }

          console.log("rad = " + rad);
          console.log("x_av = ", x_av, "y_av = ", y_av, "z_av = " + z_av);
        }


        let cmdStr = `# The master WEST configuration file for a simulation.
      # vi: set filetype=yaml :
      ---
      west: 
        system:
          driver: adaptive.System
          module_path: $WEST_SIM_ROOT/adaptive_binning/
        drivers:
          sim_manager: manager.WESimManager
          module_path: $WEST_SIM_ROOT/adaptive_binning/
          we_driver: driver.WEDriver
        propagation:
          max_total_iterations: 30
          max_run_wallclock:    72:00:00
          propagator:           executable
          gen_istates:          true
        data:
          west_data_file: west.h5
          datasets:
            - name:        pcoord
              scaleoffset: 4
            - name:        pvol
              dtype:       float32
              scaleoffset: 3
          data_refs:
            segment:       $WEST_SIM_ROOT/traj_segs/{segment.n_iter:06d}/{segment.seg_id:06d}
            basis_state:   $WEST_SIM_ROOT/bstates/{basis_state.auxref}
            initial_state: $WEST_SIM_ROOT/istates/{initial_state.iter_created}/{initial_state.state_id}
        plugins:
        executable:
          environ:
            PROPAGATION_DEBUG: 1
          datasets:
            - name:    pvol
            - name:    rog
            - name:    bb
            #- name:    fop
            #  loader:  aux_functions.coord_loader
            # enabled: true
          propagator:
            executable: $WEST_SIM_ROOT/westpa_scripts/runseg.sh
            stdout:     $WEST_SIM_ROOT/seg_logs/{segment.n_iter:06d}-{segment.seg_id:06d}.log
            stderr:     $WEST_SIM_ROOT/job_logs/runseg.log
            stdin:      null
            cwd:        null
            environ:
              SEG_DEBUG: 1
          get_pcoord:
            executable: $WEST_SIM_ROOT/westpa_scripts/get_pcoord.sh
            stdout:     /dev/null 
            stderr:     $WEST_SIM_ROOT/job_logs/get_pcoord.log
          gen_istate:
            executable: $WEST_SIM_ROOT/westpa_scripts/gen_istate.sh
            stdout:     /dev/null 
            stderr:     $WEST_SIM_ROOT/job_logs/gen_istate.log
          post_iteration:
            enabled:    true
            executable: $WEST_SIM_ROOT/westpa_scripts/post_iter.sh
            stderr:     $WEST_SIM_ROOT/job_logs/post_iter.log
          pre_iteration:
            enabled:    false
            executable: $WEST_SIM_ROOT/westpa_scripts/pre_iter.sh
            stderr:     $WEST_SIM_ROOT/job_logs/pre_iter.log
      subpex:
        # location of important files, some of them will be created by some scripts
        selection_file: /PATH/TO/SELECTION/FILE/selection_string.txt
        topology: /PATH/TO/TOPOLOGY/FILE/topology_file
        west_home: /PATH/TO/WEST/SIMULATION/DIRECTORY
        reference: /PATH/TO/REFERENCE/FILE/REFERENCE.pdb
        reference_fop: /PATH/TO/REFERENCE/FOP/FILE/fop_ref.xyz
        # progress coordinates to calculate ("jd" for Jaccard distance, "prmsd" for pocket heavy atoms RMSD, and/or bb for backbone RMSD, composite for the composite RMSD)
        pcoord:
          - composite
        # filetype for the fop.
        fop_filetype: xyz
        # Center of the pocket
        center: [`;
        cmdStr += x_av.toFixed(1) + ', ' + y_av.toFixed(1) + ', ' + z_av.toFixed(1) + `]
      # Radius of the pocket to consider
  radius: ` + rad.toFixed(1) + `
  # resolution for the FOP points.
  resolution: 0.5
  # auxiliary data to calculate. Make sure it is also on the west.cfg file.
  auxdata:
    - prmsd
    - pvol
    - bb
    - rog_pocket
    - jd
  # Number of point to calculate per trajectory segment. If -1, it will calculate all.
  calculated_points: -1
  # Clustering analysis settings
  clustering:
    clustering_engine: "cpptraj" # cpptraj or MDAnalysis (At the momemnt only cpptraj is implemented)
    number_clusters: 25
    max_number_clusters_generation_bin: 25
    min_number_clusters_generation_bin: 3
    clustering_region: "pocket" # pocket or backbone
    cluster_generation: true # cant't be true at the same time as cluster_bin
    cluster_bin: false
    bins:
      PROG_COORDINATE_CHOSEN: [ BIN, BOUDARIES, "inf" ]
      PROG_COORDINATE_CHOSEN: [ BIN, BOUDARIES, "inf" ]
    method: hierarchical
  # plotting settings
  plotting:
    num_walkers: true # plot number of walkers per iteration plot. Useful when NOT using adaptive binning`;

        return cmdStr;
      }
    } else return "Wrong pocket selection!";
  },

  /**
   * Checks if only one pocket is set to render, i.e. one and only one line of InfoTable is selected
   * @returns boolean 
   */
  "displayConfig"(): boolean {
    return this.$store.state["infoTableOnlyOneLineSelected"];
  },

}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {

  /**
   * Downloads either the receptor or ligand files.
   * @param  {*}      e     The click event.
   * @param  {string} type  The type of file, either "receptor" or "ligand".
   * @returns void
   */
  "downloadFile"(e: any, type: string): void {
    var blob = new Blob([this.$store.state[type + "Contents"]], {
      type: "text/plain;charset=utf-8"
    });
    saveBlob(blob, this.$store.state[type + "FileName"]);

    e.preventDefault();
    e.stopPropagation();
  },

  /**
 * Runs when user clicks the subpex download button.
 * @returns void
 */
  "subpexConfigDownload"(): void {
    var blob = new Blob([this["cfgStr"]], { type: "text/plain;charset=utf-8" });
    saveBlob(blob, "west.cfg");
  },

  "distanceVector"(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2));
  }
}

/**
 * Setup the vina-commandline Vue commponent.
 * @returns void
 */
export function setup(): void {
  Vue.component('fpocket-subpex', {
    /**
     * Get the data associated with this component.
     * @returns any  The data.
     */
    "data"() {
      return {
        re: new RegExp('(?=ATOM)(.*)'),
      }
    },
    "computed": computedFunctions,
    "methods": methodsFunctions,
    "template": /*html*/ `
            <sub-section v-if="fpocketParamsValidate" title="Run Subpex Using the Detected Pockets">
                <p>
                Copy or download a <a href="https://git.durrantlab.pitt.edu/erh91/SubPEx-Erich" target="_blank">SubPex</a> config file.
                </p>
                <form-group
                    id="input-group-commandline"
                    description="Use this template to run SubPex with the FpocketWeb-detected pockets. Be sure to replace the paths and make other necessary adjustments to the template file."
                >
                    <b-form-textarea
                        v-model="cfgStr"
                        v-if="displayConfig"
                        rows="3"
                        max-rows="6" 
                        style="resize: vertical; white-space: pre;" 
                        class="text-monospace" size="sm"
                    ></b-form-textarea>
                    <p v-else>Select one and only one line in <a href="#infoTable">the table above</a> to generate the config file.</p>
                    <form-button :small="true" @click.native="subpexConfigDownload">Download</form-button>
                </form-group>
            </sub-section>
        `,
    "props": {}
  })
}
