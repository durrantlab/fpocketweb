# Should be run from main directory.
rm -rf dist/*

# Copy over latest version of FileLoaderSystem if it's available.
if [ -d "../vuejs_components/src/UI/FileLoaderSystem" ]; then
    chmod -R a+wr src/UI/FileLoaderSystem
    rsync -avhr ../vuejs_components/src/UI/FileLoaderSystem src/UI/
    chmod -R a-w src/UI/FileLoaderSystem
fi