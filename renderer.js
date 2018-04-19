// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const powershell = require('node-powershell');
const fs = require("fs"); // for file system stuff
const {shell} = require('electron');
const Store = require('electron-store'); // user settings
const store = new Store();
const os = require('os'); // OS info

let ScrDir = store.get('ScriptDir'); // test for null
//let DocDir = store.get('DocumentDir');

// read scripts from dir then create html buttons - combine with doc function - create forms with optional params
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
    } else if (os.type() == 'Linux' || 'Darwin') {
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

// to get this to run on OSX, install powershell on OSX, 
    // create symlink pwsh to powershell,
    // add path /etc/paths:  /usr/local/microsoft/powershell/6.0.2 
function PoshRun(file){ // change to use jquery to add action to button  // !!combine with Bash run

    let name = file.match(/\w+/);
    let paramName = '#' + name + '-param';
    let admName = '#' + name + '-adm';
    let param = $(paramName).val();
    let Path = ScrDir + '\\' + file;
    let fulPath =  Path + ' ' + param;
    let adm = $(admName).is(':checked'); // if run as admin box is checked
    
    // works with checkbox, does not work with check box and params
    let AdmRun = 'Start-Process powershell -argumentlist "' + '-file `"'+ Path + '`" ' + param + ' -workingdirectory `"' + ScrDir + '`" -NonInteractive -NoProfile' + '" -verb runas'; 
    console.log(AdmRun);
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    //add check for adm and params
    if (adm) {ps.addCommand(AdmRun)
    } else {ps.addCommand(fulPath)};    

    ps.invoke()
    .then(output => {
        console.log(output)
    })
    .catch(err => {
        console.error(err)
        ps.dispose()
    })
};

function BashRun (file) {

    let name = file.match(/\w+/);
    let paramName = '#' + name + '-param';
    let admName = '#' + name + '-adm';
    let param = $(paramName).val();
    let Path = ScrDir + '/' + file;
    let fulPath =  Path + ' ' + param;

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
