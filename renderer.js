// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const powershell = require('node-powershell');
const fs = require("fs"); // for file system stuff
const {shell} = require('electron');

// Test jQuery
$(document).ready( () =>  console.log("Page is loaded!") )

// read scripts from dir then create html buttons - should I put this in a jquery doc.ready?
// see for info on maybe a better method https://stackoverflow.com/questions/9643311/pass-string-parameter-in-an-onclick-function
fs.readdir('./scripts', (err, dir) => {
    for(let file of dir){
        let name = file.match(/\w+/); // remove file extension
        console.log(name[0]);
        let btn = '<button id="' + name[0] + '" class="btn btn-primary" onclick="PoshRun(\''+ file +'\')" type="button">' + name[0] + '</button>';
        $('#ScriptBtn').append(btn);
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

// to get this to run on OSX, install powershell on OSX, 
    // create symlink pwsh to powershell,
    // add path /etc/paths:  /usr/local/microsoft/powershell/6.0.2 
function PoshRun(file){

    let fulPath = "./scripts/" + file;

    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand(fulPath)

    ps.invoke()
    .then(output => {
        console.log(output)
    })
    .catch(err => {
        console.error(err)
        ps.dispose()
    })
};