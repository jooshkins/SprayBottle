// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const $ = require('jquery');
const powershell = require('powershell');
const fs = require("fs"); // for file system stuff
const { shell } = require('electron');
const Store = require('electron-store'); // user settings
const store = new Store();
const os = require('os'); // OS info
const Split = require('split.js'); // splitter module for multi panes
let ScrDir = store.get('ScriptDir'); // test for null
let DocDir = store.get('DocDir');
const HomePage = store.get('HomePage');

// read scripts from dir then create html buttons - combine with doc function
fs.readdir(ScrDir, (err, dir) => { // !! reduce redundent code
    let FltrDir = dir.filter(CheckIfPs1); //filter out non script files
    for (let file of FltrDir) {
        let name = file.match(/[^./\\]+/); // remove file extension  
        let noSpaces = name[0].replace(/[\s\(\)]/g, "_"); // needed to avoid jquery err
        if (HomePage == 'index-basic.html') {
            var template = `<tr>
                <td id="${noSpaces}-sta"><button class="btn btn-primary btn-block" onclick='PoshRun("${file}")'>${name[0]}</button></td>
              </tr>`
        }
        else {
            var template = `<tr>
                <td><button id='${name[0]}-btn' class="btn btn-success" onclick='PoshRun("${file}")'>»</button></td>
                <td>${name[0]}</td>
                <td><input id='${noSpaces}-param' type="text" class="form-control" name="param"></td>
                <td>
                  <div id='${noSpaces}-sta' class="text-success text-center"></div>
                </td>
              </tr>'`;
        }
        $('#NoScr').hide();
        $('#ScriptBin').append(template);
    }
});

function LoadDocs() { // filter out files with out extension / dirs
    fs.readdir(DocDir, (err, dir) => {
        let FltrDir = dir.filter(CheckIfFile);
        for (let file of FltrDir) {
            let name = file.match(/[^./\\]+/); // remove file extension
            let template = `<tr>
            <td><a href="${DocDir}\\${file}" target="_blank" class="btn btn-outline-info"><i class="far fa-file-alt text-light"></i> ${name}</a></td>
          </tr>`
            $('#NoDoc').hide();
            $('#DocBin').append(template);
        }
    });
}

// check for file extension
function CheckIfPs1(file) { // !!combine with pdf
    return file.match(/.+\.ps1\b/);
}

function CheckIfFile(file) {
    return file.match(/.+\.\b/);
}

// for Saving path from settings page
function SetScriptDir() { // !! reduce redundent code
    let dir = document.getElementById("ScriptDir").files[0].path;
    store.set('ScriptDir', dir);
    GetDirs(); // reload path after applying
}

function SetDocDir() {  // !! reduce redundent code
    let dir = document.getElementById("DocDir").files[0].path;
    store.set('DocDir', dir);
    GetDirs();  // reload path after applying
}

function GetDirs() {
    $("#ReadPathScript").html(store.get('ScriptDir'));
    $("#ReadPathDoc").html(store.get('DocDir'));
}

function SetHomePage(page) {  // !! reduce redundent code
    store.set('HomePage', page);
    console.log('homepage: ' + page);
}

function ClearConsole() {
    $("#console").text('');
}

function LoadSettingsNav() {
    if (HomePage == 'index-basic.html') {
        var template = `<ul class="navbar-nav">
        <li class="navbar-nav">
          <a class="nav-link" href="index-basic.html"><i class="fas fa-wrench text-danger fa-fw fa-lg"></i> Self-Service</a>
        </li>
        <li class="navbar-nav">
          <a class="nav-link" href="info-basic.html"><i class="fas fa-info text-info fa-fw fa-lg"></i>Info</a>
        </li>
      </ul>`;
    }
    else {
        var template = `<ul class="navbar-nav">
        <li class="navbar-nav small">
          <a class="nav-link" href="index.html"><i class="fas fa-code text-danger fa-lg"></i> Actions</a>
        </li>
        <li class="navbar-nav small">
          <a class="nav-link" href="info.html"><i class="fas fa-info text-info fa-fw fa-lg"></i>Info</a>
        </li>
        <li class="navbar-nav active small">
          <a class="nav-link" href="settings.html"><i class="fas fa-cog fa-fw text-warning fa-lg"></i> Settings</a>
        </li>
      </ul>`
    }
    $("nav").html(template);
}

function PoshRun(file) {
    let name = file.match(/[^./\\]+/);
    let noSpaces = name[0].replace(/[\s\(\)]/g, "_");
    let paramName = '#' + noSpaces + '-param';
    let staName = '#' + noSpaces + '-sta';
    let param = $(paramName).val();
    let Path = ScrDir + '\\' + file;
    let fulPath = Path + ' ' + param;

    if (HomePage == 'index-basic.html') {
        var TemplateErr = `<button class="btn btn-danger btn-block" onclick="PoshRun('${file}')">${name[0]} - Failed</button>`;
        var TemplateSuc = `<button type="button" class="btn btn-success btn-block" disabled>${name[0]} - Success</button>`;
        var TemplateWor = `<div id="${noSpaces}-sta" class="progress" style="height:40px">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning text-dark" style="width:100%; height:45px"><h6>Updating</h6></div>`;
    } else {
        var TemplateErr = `<div class="text-danger text-center"><i class="fas fa-times fa-2x"></i>`;
        var TemplateSuc = `<i class="fas fa-check-square fa-2x"></i>`;
        var TemplateWor = `<div class="text-muted text-center"><i class="fas fa-cog fa-spin fa-2x"></i>`;
    };

    if (os.type() == 'Linux' || os.type() == 'Darwin') {
        var pwsh = true
    } else { var pwsh = false };

    $(staName).html(TemplateWor) // set status to inprogress

    var cmd = fulPath;
    console.log(cmd);
    let ps = new powershell(cmd, {
        executionPolicy: 'Bypass',
        noProfile: true,
        PSCore: pwsh
    })
    // Handle process errors (e.g. powershell not found) // only runs when error
    ps.on("error", err => {
        let msg = err + '<br>';
        $('#console').append(msg);
        $(staName).html(TemplateErr);
    });
    // Stdout // always runs
    ps.on("output", data => {
        if (data) {
            let msg = data + '<br>';
            $('#console').append(msg);
            $(staName).html(TemplateSuc);
        }
    });
    // Stderr // only runs when error
    ps.on("error-output", data => {
        let msg = data + '<br>';
        $('#console').append(msg);
        $(staName).html(TemplateErr);
    });
};


