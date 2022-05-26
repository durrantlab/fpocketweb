# FPocketWeb 1.0.0 #

## Introduction

FPocketWeb runs _fpocket_, a popular program for identifying cavities in protein
surfaces, entirely in a web browser. The pocket-hunting calculations occur on
the user's own computer rather than a remote server. The FPocketWeb app includes
a convenient interface, so users can easily set up their pocket-finding runs and
analyze the results. A working version of the app can be accessed free of charge
from [http://durrantlab.com/fpocketweb](http://durrantlab.com/fpocketweb).

## Compatibility

We have tested FPocketWeb on all major operating systems (Linux, macOS, Windows,
Android, iOS) and web browsers (Chrome, Firefox, Safari, Edge).

<!-- ## Repository Contents

* `dist/`: The production (distribution) files. If you wish to run the FPocketWeb
  library or web app on your own server, these are the only files you need.
  For convenience, the `webina.zip` contains the contents of the `dist/`
  directory.
  * `dist/minimal_example.html` shows how to use the FPocketWeb library in your
    own programs.
  * `dist/index.html` starts the FPocketWeb web app (see
    [http://durrantlab.com/webina](http://durrantlab.com/webina) for a working
    example).
* `src/`: The FPocketWeb source files. You cannot use these files directly. They
  must be compiled.
* `utils/`, `package.json`, `package-lock.json`, `tsconfig.json`: Files used
  to compile the contents of the `src/` directory to the `dist/` directory.
* `CHANGELOG.md`, `CONTRIBUTORS.md`, `README.md`: Documentation files. -->

## Description of Use

### Input Parameters Tab

The "Input Parameters" tab includes the "Input File" and "Advanced Parameters"
subsections. In the "Input File" subsection, users can specify the protein file
(PDB format) for pocket hunting. The contents of these files are loaded into the
browser's memory, but they are never transmitted/uploaded to any third-party
server. Users who wish to simply test FPocketWeb can instead click the "Use
Example File" button to load a preprepared structure of _H. sapiens_ heat shock
protein 90 (Hsp90, PDB 5J2V). Loaded files are displayed in the "PDB Preview"
subsection using a 3Dmol.js molecular viewer.

The "Advanced Parameters" subsection allows users to specify the same parameters
available through the _fpocket_ command-line executable, so they can fine-tune
the underlying pocket-finding method. FPocketWeb initially hides these
parameters because most users will prefer to use the default values. Once ready,
users can click the "Start FPocketWeb" button to initiate the
FPocketWeb run.

### Output Tab

FPocketWeb displays the "Output" tab once the calculations are complete, which
includes the "Visualization" and "Detected Pockets" subsections, among others.
The "Visualization" subsection displays the specified protein and detected
cavities. Initially, only the pocket with the highest _fpocket_ score is
displayed.

The "Detected Pockets" subsection contains a table with the detailed output for
each detected pocket, one pocket per row. Initially, only the score, the
druggability score, the number of alpha spheres, and the volume are displayed,
but the "Show Details" toggles allow users to display all other _fpocket_
metrics for each detected pocket. Users can also change the color used to
visualize each pocket.

The "Output Files" subsection allows users to view the FPocketWeb output PDB
file directly. This file includes the original protein structure and all the
detected pockets. Users can press the associated "Download" button to save the
file to disk.

Finally, the "Run Fpocket from the Command Line" subsection provides a code
snippet so users can run _fpocket_ from the command line with the same
FPocketWeb parameters used in the browser.

#### Start Over Tab

The "Start Over" tab displays a simple button that allows the user to restart
the FPocketWeb app. A warning message reminds the user that they will lose the
results of the current FPocketWeb run unless they have saved their output files.

## Running FPocketWeb on Your Own Computer

Most users will wish to simply access the already compiled, publicly available
FPocketWeb web app at
[http://durrantlab.com/fpocketweb](http://durrantlab.com/fpocketweb). If you
wish to instead run FPocketWeb on your own UNIX-like computer (LINUX, macOS,
etc.), follow these instructions:

1. Download the
   [fpocketweb.zip](https://durrantlab.com/fpocketweb/fpocketweb.zip) file
2. Uncompress the file: `unzip fpocketweb.zip`
3. Change to the new `fpocketweb/` directory: `cd fpocketweb`
4. Start a local server. We recommend using `Node.js` and `npm`:
   * `npm install -g http-server`
   * `http-server`
5. Access the server from your web browser (e.g., `http://localhost:8080/`,
   `http://0.0.0.0:8080/`, `http://127.0.0.1:8080/`, etc.)

Running FPocketWeb on other operating systems (e.g., Windows) should be similar.

<!-- ## Compiling the FPocketWeb Web App

The vast majority of users will not need to compile the FPocketWeb web app on
their own. Simply use the already compiled files in `dist/` or `webina.zip`. If
you need to make modifications to the source code, these instructions should
help with re-compiling on UNIX-like systems:

1. Clone or download the git repository: `git clone https://git.durrantlab.pitt.edu/jdurrant/webina.git`
2. Change into the new `webina` directory: `cd webina`
3. Install the required `npm` packages: `npm install`
4. Fix any vulnerabilities: `npm audit fix`
5. Make sure Python is installed system wide, and that `python` works from the
   command line (tested using Python 2.7.15)
6. To deploy a dev server: `npm run start`
7. To compile the contents of `src/` to `dist/`: `npm run build`

Note: The FPocketWeb-library source code is located at `src/FPocketWeb/`. It has a
separate build system (`/src/FPocketWeb/compile.sh`). If you modify any of the
files in `/src/FPocketWeb/src/`, be sure to run `compile.sh` before building the
larger web app via `npm run build`. -->

<!-- ## Compiling the AutoDock Vina 1.1.2 Codebase to WebAssembly

We used Emscripten version 1.38.48 to compile the Vina 1.1.2 codebase to
WebAssembly. As mentioned in our manuscript, the key to successful compilation
was to provide Emscripten with the required Boost include files. We used this
command to compile the Boost libraries:

`./bjam link=static variant=release threading=multi runtime-link=static thread
program_options filesystem system serialization`

The resulting binaries were written to
`<boost>/bin.v2/libs/<lib_name>/build/gcc-1.38.48/release/link-static/runtime-link-static/threading-multi`

These binaries had to be linked to `em++` during the compilation process by
modifying the Vina Makefile. Specifically, the included headers had to be
linked/copied under `<emsdk_path>/fastcomp/emscripten/system/include/`.

A detailed description of this process is beyond the scope of this README
file, though many helpful tips have been posed online. -->

## Notes on User Analytics

In some circumstances, the FPocketWeb web app may report usage statistics to
Google Analytics. These reports are useful for securing and justifying funding
for the Durrant lab. Usage statistics are only sent if the web-app URL contains
the substring "durrantlab," so installing FPocketWeb on your own server should
prevent reporting. Even when using the publicly available version of FPocketWeb
hosted at [http://durrantlab.com/fpocketweb](http://durrantlab.com/fpocketweb),
information about your specific protein is never transmitted to any remote
server.
