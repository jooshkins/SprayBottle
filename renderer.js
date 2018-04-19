// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const powershell = require('powershell');
const fs = require("fs"); // for file system stuff
const {shell} = require('electron');
const Store = require('electron-store'); // user settings
const store = new Store();
const os = require('os'); // OS info

let ScrDir = store.get('ScriptDir'); // test for null
//let DocDir = store.get('DocumentDir');

// read scripts from dir then create html buttons - combine with doc function
fs.readdir(ScrDir, (err, dir) => { // !! reduce redundent code
    if (os.type() == 'Windows_NT'){
        let FltrDir = dir.filter(CheckIfPs1); //filter out non script files
        for(let file of FltrDir){
            let name = file.match(/\w+/); // remove file extension
            console.log(name[0]);
            let btn = '<button id="' + name[0] + '" class="btn btn-primary" onclick="PoshRun(\''+ file +'\')" type="button">' + name[0] + '</button>';
            let form = '<input id="' + name[0] + '-param" type="text" name="param"><br>';
            let chk = '<input id="' + name[0] + '-adm" type="checkbox" name="adm"><br>';
            $('#ScriptBin').append(btn);
            $('#ScriptBin').append(form);
            $('#ScriptBin').append(chk);
        }
    } else if (os.type() == 'Linux' || os.type() == 'Darwin') {
        for(let file of dir){
            let name = file.match(/\w+/); // remove file extension
            console.log(name[0]);
            let btn = '<button id="' + name[0] + '" class="btn btn-primary" onclick="BashRun(\''+ file +'\')" type="button">' + name[0] + '</button>';
            let form = '<input id="' + name[0] + '-param" type="text" name="param"><br>';
            let chk = '<input id="' + name[0] + '-adm" type="checkbox" name="adm"><br>';
            $('#ScriptBin').append(btn);
            $('#ScriptBin').append(form);
            $('#ScriptBin').append(chk);
        }
    }
});

fs.readdir('./doc', (err, dir) => {
    for(let file of dir){
        let name = file.match(/\w+/); // remove file extension
        console.log(name[0]);
        let lnk = '<a href=./doc/' + file + ' target="_blank">' + name[0] + '</a>';
        $('#InfoBin').append(lnk);
    }
});

// check for file extension
function CheckIfPs1(file) { // !!combine with pdf
    return file.match(/.+\.ps1\b/);
}

function CheckIfPdf(file) {
    return file.match(/.+\.pdf\b/);
}

// for Saving path from settings page
function SetScriptDir(){
    let dir = document.getElementById("ScriptDir").files[0].path;
    store.set('ScriptDir', dir);
}

function GetScriptDir(){
    $('.alert .message').html(store.get('ScriptDir'));
    $('.alert').show();
}

// install powershell core for OSX or Linux 
function PoshRun(file){ // change to use jquery to add action to button  // !!combine with Bash run

    let name = file.match(/\w+/);
    let paramName = '#' + name + '-param';
    let admName = '#' + name + '-adm';
    let param = $(paramName).val();
    let Path = ScrDir + '\\' + file;
    let fulPath =  Path + ' ' + param;
    let adm = $(admName).is(':checked'); // if run as admin box is checked
    let AdmRun = 'Start-Process powershell -argumentlist "' + '-file `"'+ Path + '`" ' + param + ' -workingdirectory `"' + ScrDir + '`" -NonInteractive -NoProfile' + '" -verb runas'; 

    if (os.type() == 'Linux' || os.type() == 'Darwin') {var pwsh = true
    } else {var pwsh = false};

    if (adm) {var cmd = AdmRun
    } else {var cmd = fulPath};    

    let ps = new powershell(cmd, {
        executionPolicy: 'Bypass',
        noProfile: true,
        PSCore: pwsh
    })

    // Handle process errors (e.g. powershell not found)
    ps.on("error", err => {
        console.error(err);
    });
    // Stdout
    ps.on("output", data => {
        console.log(data);
    });
    // Stderr
    ps.on("error-output", data => {
        console.error(data);
    });
    // End
    ps.on("end", code => {
        // Do Something on end
    });
};

function BashRun (file) {

    let name = file.match(/\w+/);
    let paramName = '#' + name + '-param';
    let admName = '#' + name + '-adm';
    let param = $(paramName).val();
    let Path = ScrDir + '/' + file;
    //let fulPath = 'powershell.exe ' + Path + ' ' + param;  // works with windows, and does not produce extra terminal window
    let fulPath = Path + ' ' + param;
    let adm = $(admName).is(':checked'); // if run as admin box is checked

    if (adm) { // run as adm
        var sudo = require('sudo-prompt');
        var options = {
        name: 'Electron',
        };
        sudo.exec(fulPath, options,
        function(error, stdout, stderr) {
            if (error) throw error;
            console.log('stdout: ' + stdout);
        }); 
    } else { // run as non admin
        const { exec } = require('child_process');
        exec(fulPath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        });
    };    
};
