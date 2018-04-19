const $ = require('jquery');
const powershell = require('node-powershell');
const fs = require("fs"); // for file system stuff

const os = require('os');
msg = os.type();
console.log('os is:' + msg);

let ScrDir = "C:\\script";
console.log('dir is:' + ScrDir);

// check for file extension
function CheckIfExec(file) {

    if (os.type() == 'Windows_NT'){
        console.log('returning PC results');
        return file.match(/.+\.ps1\b/);
    }
    else {
        console.log('returning nonPC results');
    }
};

fs.readdir(ScrDir, (err, dir) => {
    let FltrDir = dir.filter(CheckIfExec); //filter out non script files

    for(let file of FltrDir){
        let name = file.match(/\w+/); // remove file extension
        console.log(name[0]);
    }
});