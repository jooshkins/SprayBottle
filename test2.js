const powershell = require('node-powershell');

function PoshRun(file, param){

    let fulPath = ScrDir + '\\' + file;
    //let params = [{name:'str', value:'node-powershell rocks'}];

    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand(fulPath, param)

    ps.invoke()
    .then(output => {
        console.log(output)
    })
    .catch(err => {
        console.error(err)
        ps.dispose()
    })
};

let ScrDir = "C:\\Users\\Joosh\\Documents\\---Projects---\\git\\lackey\\scripts"
let params = [{pc:'pc1'}, {fl:'bestfile'}]
//let params = [{name:'pc', value:'pc2', name:'fl', value:'winner'}]    --- other way to define params
PoshRun('script1.ps1', params);