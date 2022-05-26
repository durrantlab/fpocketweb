# Should be run from main directory.
rm -rf dist/*

# Copy over latest version of FileLoaderSystem if it's available.
if [ -d "../vuejs_components/src/UI/FileLoaderSystem" ]; then
    chmod -R a+wr src/UI/FileLoaderSystem
    rsync -avhr ../vuejs_components/src/UI/FileLoaderSystem src/UI/
    chmod -R a-w src/UI/FileLoaderSystem
fi

# Compile fpocketweb js if needed
# Check if src/FpocketWeb/dist exists
if [ ! -d "src/FpocketWeb/dist" ]; then
    echo
    echo "FPocketWeb not compiled. Directory does not exist: src/FpocketWeb/dist"
    echo "Compiling FPocketWeb..."
    echo
    cd src/FpocketWeb
    ./compile.sh
    cd -
else
    echo
    echo "FPocketWeb already compiled. Skipping."
    echo "Using files in src/FpocketWeb/dist"
    echo
fi