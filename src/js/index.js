const remote = require('electron').remote;
var exec = require('child_process').execFile;
const request = require('request');
const decompress = require('decompress');
const fs = require('fs');

const win = remote.getCurrentWindow();

var VERSION_FILE = ".siegeworlds/version.txt";

var currentVersion = -1;
var currentVersionText = "";
var installedVersion = -1;
var gameDirectiory = process.cwd() + "\\.siegeworlds\\swclient.exe";

init();
var downloading = false;

setInterval(checkLatestVersion, 10000); // Check for new version of the game every 10s

function init() {
    try {
        // Try to delete any leftover .zip for the game client
        fs.unlinkSync("sw_windows_client.zip");
    } catch (err) {
        // Not handled
    }

    checkLatestVersion();
}

function checkLatestVersion() {

    if (downloading) {
        return;
    }

    $.get('https://siegeworlds-320f73534b59.herokuapp.com/api/version', result => {
        console.log("API Response:", result); // Log the entire response for debugging

        if (result && result.version) {
            currentVersion = parseInt(result.version.replaceAll(".", ""));
            console.log("Current Version:", currentVersion);
        } else {
            console.log("Version field is missing or undefined.");
        }

        currentVersionText = result.version.replaceAll(".", "-");

        installedVersion = getInstalledVersion();

        if (currentVersion == installedVersion) {
            downloading = false;
            document.getElementById("updatetext").innerHTML = "Siege Worlds is up to date.";
            document.getElementById("btndownload").innerHTML = "Play";
            document.getElementById("btndownload").disabled = false;
        } else if (installedVersion < currentVersion) {
            if (!downloading) {
                downloadFile("https://www.siegeworlds.com/downloads/siegeworlds_" + currentVersionText + "_win.zip", "sw_windows_client.zip");
                document.getElementById("btndownload").disabled = true;
                document.getElementById("btndownload").innerHTML = "Updating...";
            }
        }
    });
}

document.getElementById('btndownload').addEventListener("click", event => {
    if (installedVersion < currentVersion) {
        downloadFile("https://www.siegeworlds.com/downloads/siegeworlds_" + currentVersionText + "_win.zip", "sw_windows_client.zip");
        document.getElementById("btndownload").disabled = true;
        document.getElementById("btndownload").innerHTML = "Updating...";
    } else {
        exec('.siegeworlds/Siege Worlds.exe', function (err, data) {
            //console.log(err)
            //console.log(data.toString());
        });
    }
});

document.getElementById('btnclearcache').addEventListener("click", event => {
    //delete all contents in .siegeworlds folder
    fs.rmdirSync(".siegeworlds", { recursive: true });
    document.getElementById("updatetext").innerHTML = "Clearing cache. Please wait...";
});

function getInstalledVersion() {
    try {
        if (fs.existsSync(VERSION_FILE)) {
            try {
                const data = fs.readFileSync(VERSION_FILE, 'utf8');
                return parseInt(data);
            } catch (err) {
                console.error(err);
            }
        }
    } catch (err) {
        return -1;
    }
    return -1;
}

function downloadFile(file_url, targetPath) {
    downloading = true;

    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function (data) {
        total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function (chunk) {
        received_bytes += chunk.length;
        document.getElementById("updatetext").innerHTML = "Downloading: " + parseInt(received_bytes / 1000000) + "/" + parseInt(total_bytes / 1000000) + "MB";
    });

    req.on('end', function () {

        document.getElementById("updatetext").innerHTML = "Extracting files...";

        decompress("sw_windows_client.zip", ".siegeworlds").then(() => {
            console.log("Files extracted successfully.");

            // Write the current version to version.txt
            const versionFilePath = ".siegeworlds/version.txt";
            fs.writeFileSync(versionFilePath, currentVersion.toString(), 'utf8');
            console.log(`Version file created: ${versionFilePath}`);

            downloading = false;

            checkLatestVersion(); // Update play button
        }).catch(err => {
            console.error("Error extracting ZIP file:", err);
            document.getElementById("updatetext").innerHTML = "Error during extraction.";
        });
    });
}
