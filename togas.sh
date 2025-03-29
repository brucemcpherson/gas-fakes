# this simple script comments out the node import stuff 
# and moves selected files recursively to a folder that can be moved to gas with clasp
# load in environment variables from root folder
ROOT_DIRECTORY=$(git rev-parse --show-toplevel)
set -a
source "$ROOT_DIRECTORY/.env"
set +a

TARGET="testongas"

# Define the input folder
SOURCE="test"

# a spec to match extension
EXT="*.js"

# whether to push with clasp
CLASP=true

# the soure appsscript.json manifest should be in the top level 
cp ${SOURCE}/appsscript.json ${TARGET}
cp ${SOURCE}/imports.js ${TARGET}/test
cp ${SOURCE}/test.js ${TARGET}/test

# find all the copied files and comment/fixes out import and export statements
# note - this simple version naively expects that to be on 1 line
sed -i 's/^import\s\s*/\/\/import /g' $(find "${TARGET}" -name "${EXT}" -type f) 
sed -i 's/^\s*export\s\s*//g' $(find "${TARGET}" -name "${EXT}" -type f)

# replace all process.env.VAR_NAME occurrences with actual value
# process.env is not usable in apps script
for var in $(grep -oP 'process\.env\.\K\w+' "${TARGET}/test/test.js"); do
    value=$(printenv "$var")  # Get the environment variable value

    # Check if the value contains non-numeric characters (treat as a string)
    if [[ "$value" =~ [^0-9] ]]; then
        value="\"$value\""  # Add double quotes
    fi

    # Replace process.env.VARIABLE_NAME with the actual value
    sed -i "s|process.env.$var|$value|g" ${TARGET}/test/test.js
done

# now go to the target and push and open if required
if [ "$CLASP" = true ] ; then
  cd "${TARGET}"
  clasp push
fi









