import React from 'react'
import { Button, ButtonGroup, Intent, Checkbox} from '@blueprintjs/core';
import ScriptStatus from './ScriptStatus'
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'

const electron = window.require('electron');
const powershell = electron.remote.require('powershell');
const sudo = electron.remote.require('sudo-prompt');
const fs = window.require("fs");
const Store = window.require('electron-store');
const store = new Store();

const CheckIfPs1 = (file) => {
    return file.match(/.+\.ps1\b/);
}

class ScriptTableSimple extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runList: [],
            lastRun: 0,
            scripts: store.get('scripts', []),
            scriptPath: store.get('scriptPath'),
            scriptPathMTime: store.get('scriptPathMTime', 0)
        }
        this.loadScripts = this.loadScripts.bind(this);
        this.runPosh = this.runPosh.bind(this);
        this.runBatch = this.runBatch.bind(this);
        this.updateBatch = this.updateBatch.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateScripts = this.updateScripts.bind(this);
        this.updateTableHeight = this.updateTableHeight.bind(this);
        this.updateTablePageSize = this.updateTablePageSize.bind(this);
        this.clearTable = this.clearTable.bind(this);

        this.loadScripts()
    };

    loadScripts() {
        if (this.state.scriptPath !== undefined) { // if script path is set
            fs.stat(this.state.scriptPath, (err, stats) => {
                if (this.state.scriptPathMTime !== stats.mtimeMs) { // if folder modify time has changed 
                    fs.readdir(this.state.scriptPath, (err, dir) => {
                        if (dir !== undefined) { // if folder actually exists
                            let files = dir.filter(CheckIfPs1);
                            store.set('numFiles', files.length); // re-add file count just in case
                            let scriptsCopy = this.state.scripts.slice(0);
        
                            for (let file of files) {
                                let script = {
                                    bat: false,
                                    name: file,
                                    param: '',
                                    adm: false,
                                    status: '',
                                    log: [],
                                    path: this.state.scriptPath + '\\' + file
                                }
                                scriptsCopy.push(script)
                            };
                            this.setState({
                                scripts: scriptsCopy
                            })
                            store.set('scripts', scriptsCopy)
                        }
                    });
                    store.set('scriptPathMTime', stats.mtimeMs)
                }
            })
        }
    }

    updateTableHeight() {
        let height = window.innerHeight - 140;
        this.setState({ tableHeight: height });
    }

    updateTablePageSize() {
        let n = store.get('numFiles', 0)
        let p;
        if (n === 0) {
            p = 100
        } else if (n <= 10 && n !== 0) {
            p = 10
        } else {
            p = n + 1;
        }
        this.setState({pageSize: p})
    }

    componentWillMount() {
        this.updateTablePageSize();
    }

    componentDidMount() {
        this.updateTableHeight();
        window.addEventListener('resize', this.updateTableHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateTableHeight);
    }

    updateScripts(id, prop, data, add) {
        if (add) {
            let scripts = [...this.state.scripts];
            scripts[id][prop].push(data)
            this.setState({ scripts })
            store.set('scripts', scripts)
        } else {
            let scripts = [...this.state.scripts];
            scripts[id][prop] = data
            this.setState({ scripts })
            store.set('scripts', scripts) 
        }
    }

    runPosh(id, list, event) {
        this.updateScripts(id, 'status', 'working')
        this.updateScripts(id, 'log', [])
        let run = this.state.lastRun;
        let cmd = `${this.state.scripts[id].path} '${this.state.scripts[id].param}'`;

        if (this.state.scripts[id].adm) {
            let admCmd = `powershell.exe ${cmd}`
            let options = { name: 'SprayBottle' };
            let updateScripts = this.updateScripts;
            let updateBatch = this.updateBatch;

            sudo.exec(admCmd, options,
                function (error, stdout, stderr) {
                    if (error) {
                        updateScripts(id, 'log', error.message, true)
                        updateScripts(id, 'status', 'error')
                    }
                    if (stdout) {
                        updateScripts(id, 'log', stdout, true)
                        updateScripts(id, 'status', 'success')
                        updateBatch(run, list)
                    }
                    if (stderr) {
                        updateScripts(id, 'log', stderr, true)
                        updateScripts(id, 'status', 'error')
                    }
                },
            );
        }

        else {
            let ps = new powershell(cmd, {
                executionPolicy: 'Bypass',
                noProfile: true,
            })
            ps.on("error", err => {
                if (err) {
                    this.updateScripts(id, 'log', err, true)
                    this.updateScripts(id, 'status', 'error')
                }
            });
            ps.on("output", data => {
                if (data) {
                    this.updateScripts(id, 'log', data, true)
                    this.updateScripts(id, 'status', 'success')
                    this.updateBatch(run, list)
                }
            });
            ps.on("error-output", data => {
                if (data) {
                    this.updateScripts(id, 'log', data, true)
                    this.updateScripts(id, 'status', 'error')
                }
            });
        }
        if (event) {event.preventDefault();}
    }

    runBatch() {
        let list = [];
        this.state.scripts.map((script, i) => {
            if (script.bat) {
                list.push(i);
                }
            }
        );
        if (list.length > 0) {
            this.setState({runList: list})
            this.runPosh(list[0], list)
        }
    }

    updateBatch(run, list) {
        run ++
        if (list.length > run) {
            this.setState({lastRun: run});
            this.runPosh(list[run], list);
        } else if (list.length === run) {
            this.setState({lastRun: 0})
            this.setState({runList: []})
        }
    }

    handleChange(event) {
        if (event.target.type === "text") {
            this.updateScripts(event.target.id, 'param', event.target.value)
        } else if (event.target.id.match(/adm-/g)) {
            let id = event.target.id.slice(4)
            this.updateScripts(id, 'adm', event.target.checked)
        } else if (event.target.id.match(/bat-/g)) {
            let id = event.target.id.slice(4)
            this.updateScripts(id, 'bat', event.target.checked)
        } 
    }

    clearTable() {
        let scripts = [];
        this.state.scripts.map((script) => {
                script.bat = false;
                script.param =  '';
                script.adm = false;
                script.status = '';
                scripts.push(script);
            }
        );
        store.set('scripts', scripts)
        this.setState({ scripts })
    }

    render() {
        const cellRendererStatus = (cellInfo) => {
            let log = this.state.scripts[cellInfo.index].log;
            switch (cellInfo.value) {
                case 'working':
                    return (
                        <div>
                            <ScriptStatus
                                mode="spinner"
                                content={log}
                            />
                        </div>
                    );
                    break;
                case 'success':
                    return (
                        <div>
                            <ScriptStatus
                                mode="icon"
                                content={log}
                                icon="tick-circle"
                                intent={Intent.SUCCESS}
                            />
                        </div>
                    );
                    break;
                case 'error':
                    return (
                        <div>
                            <ScriptStatus
                                mode="icon"
                                content={log}
                                icon="warning-sign"
                                intent={Intent.DANGER}
                            />
                        </div>
                    );
                    break;
                default:
                    return (<div></div>);
            }
        };

        const columns = [
            {
                Header: 'Select',
                width: 60,
                accessor: 'bat',
                Cell: props =>
                <Checkbox
                    id={'bat-' + props.index}
                    checked={props.value}
                    style={{ marginTop: 5, marginLeft: 5}}
                    onChange={this.handleChange}
                    large={true}
                />
            }, {
                Header: 'Action',
                accessor: 'name',
                Cell: props =>
                    <div>
                        {props.value.match(/[^./\\]+/)}
                    </div>
            }, {
                Header: 'Status',
                width: 60,
                accessor: 'status',
                Cell: cellRendererStatus
            }
        ]
        return (
            <div>
                <ReactTable
                    showPagination={false}
                    data={this.state.scripts}
                    columns={columns}
                    defaultPageSize={this.state.pageSize}
                    noDataText="No scripts detected."
                    style={{
                        height: this.state.tableHeight,
                    }}
                    className="-striped react-table"
                />
                <ButtonGroup
                fill={true}
                > 
                    <Button
                    text="Run Actions"
                    onClick={this.runBatch}
                    icon="play"
                    minimal={false}
                    large={true}
                    intent={Intent.SUCCESS}
                    style={{margin: 10}}
                    />
                </ButtonGroup>
            </div>
        );
    }
}

export default ScriptTableSimple;