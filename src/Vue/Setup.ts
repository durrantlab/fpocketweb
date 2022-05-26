// This file is part of FPocketWeb, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.


import * as NumericInput from "../UI/Forms/NumericInput";
import * as CheckBox from "../UI/Forms/CheckBox";
// import * as FileInput from "../UI/Forms/FileInput";
import * as FpocketParams from "../UI/Tabs/FpocketParams";
import * as FpocketRunning from "../UI/Tabs/FpocketRunning";
import * as FpocketOutput from "../UI/Tabs/FpocketOutput";
import * as StartOver from "../UI/Tabs/StartOver";
import * as FormGroup from "../UI/Forms/FormGroup";
import * as ThreeDMol from "../UI/ThreeDMol";
import * as TripleNumeric from "../UI/Forms/TripleNumeric";
import * as ResultsTable from "../UI/ResultsTable";
import * as OpenModal from "../UI/OpenModal";
import * as SubSection from "../UI/SubSection";
import * as FpocketCommandline from "../UI/FpocketCommandline";
import * as FpocketSubpex from "../UI/FpocketSubpex";
import * as FormButton from "../UI/Forms/FormButton";
import * as DropDown from "../UI/Forms/DropDown";
import * as DownloadExample from "../UI/Forms/DownloadExample";
import * as InfoTable from "../UI/InfoTable";

// installing the new FileLoader component
import { setupMolLoader } from "../UI/FileLoaderSystem/MolLoader.Vue";

declare var Vue;
declare var Vuex;
declare var BootstrapVue;

/**
 * Load and setup all Vue components.
 * @returns void
 */
export function setup(): void {
    Vue.use(BootstrapVue)
    Vue.use(Vuex)

    SubSection.setup();
    FormButton.setup();
    FpocketCommandline.setup();
    FpocketSubpex.setup();
    OpenModal.setup();
    FormGroup.setup();
    ThreeDMol.setup();
    NumericInput.setup();
    TripleNumeric.setup();
    CheckBox.setup();
    // FileInput.setup();
    DropDown.setup();
    DownloadExample.setup();
    ResultsTable.setup();
    FpocketParams.setup();
    FpocketRunning.setup();
    FpocketOutput.setup();
    InfoTable.setup();
    StartOver.setup();

    setupMolLoader();
}
