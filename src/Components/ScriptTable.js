import React from 'react'
import { Button, ButtonGroup, Switch, Intent, Checkbox, Tooltip} from '@blueprintjs/core';
import ScriptStatus from './ScriptStatus'
import AddScriptButtonSimple from './AddScriptButtonSimple'
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

class ScriptTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runList: [],
            lastRun: 0,
            errAct: '0',
            scripts: store.get('scripts', []),
            scriptPath: store.get('scriptPath'),
            scriptPathMTime: store.get('scriptPathMTime', 0)
        }
        this.loadScripts = this.loadScripts.bind(this);
        this.runPosh = this.runPosh.bind(this);
        this.runSerial = this.runSerial.bind(this);
        this.runParallel = this.runParallel.bind(this);
        this.updateBatch = this.updateBatch.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateScripts = this.updateScripts.bind(this);
        this.updateTableHeight = this.updateTableHeight.bind(this);
        this.updateTablePageSize = this.updateTablePageSize.bind(this);
        this.clearTable = this.clearTable.bind(this);
        this.addScript = this.addScript.bind(this);

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
                                    con: false,
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
        let height = window.innerHeight - 110;
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
        let errAct = this.state.scripts[id].con;

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
                        if (errAct) {updateBatch(run, list)}
                    }
                    if (stdout) {
                        updateScripts(id, 'log', stdout, true)
                        updateScripts(id, 'status', 'success')
                        updateBatch(run, list)
                    }
                    if (stderr) {
                        updateScripts(id, 'log', stderr, true)
                        updateScripts(id, 'status', 'error')
                        if (errAct) {updateBatch(run, list)}
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
                    if (errAct) {this.updateBatch(run, list)}
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
                    if (errAct) {this.updateBatch(run, list)}
                }
            });
        }
        if (event) {event.preventDefault();}
    }

    runSerial() {
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

    runParallel() {
        let list = [];
        this.state.scripts.map((script, i) => {
            if (script.bat) {
                list.push(i);
                }
            }
        );
        list.map(script => {
            this.runPosh(script, []);
        });
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
        } else if (event.target.id.match(/con-/g)) {
            let id = event.target.id.slice(4)
            this.updateScripts(id, 'con', event.target.checked)
        } else if (event.target.id === 'errAct') {
            this.setState({errAct: event.target.value})
        }
    }

    clearTable() {
        let scripts = [];
        this.state.scripts.map((script) => {
                script.bat = false;
                script.param =  '';
                script.adm = false;
                script.con = false;
                script.status = '';
                scripts.push(script);
            }
        );
        store.set('scripts', scripts)
        this.setState({ scripts })
    }

    addScript(event) {
        if (event.target.files.length > 0) {
            let script = {
                name: event.target.files[0].name,
                param: '',
                adm: false,
                status: '',
                log: [],
                path: event.target.files[0].path
            }
            let scripts = [...this.state.scripts];
            scripts.push(script)
            this.setState({ scripts })
            store.set('scripts', scripts)
        }
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
                    large={true}
                    checked={props.value}
                    style={{ marginTop: 5, marginLeft: 5}}
                    onChange={this.handleChange}
                />
            }, {
                Header: 'Script',
                accessor: 'path',
                Cell: props =>
                    <a
                        href={props.value}
                        target="_blank">{props.value.match(/[^/\\]+$/)}
                    </a>
            }, {
                Header: 'Parameter',
                accessor: 'param',
                Cell: props =>
                    <input className="pt-input pt-fill"
                        id={props.index}
                        value={props.value}
                        onChange={this.handleChange}
                        type="text"
                        placeholder="Enter Parameters..."
                    />
            }, {
                Header: 'Admin',
                width: 60,
                accessor: 'adm',
                Cell: props =>
                    <Switch
                        id={'adm-' + props.index}
                        large={true}
                        style={{ marginTop: 5 }}
                        checked={props.value}
                        onChange={this.handleChange}
                    />
            }, {
                Header: () => (
                    <Tooltip
                    content="Continue on Error"
                    hoverOpenDelay={500}
                    >
                        <span>Continue on Error</span>
                    </Tooltip>
                ),
                accessor: 'con',
                width: 80,
                Cell: props =>
                    <Checkbox
                    id={'con-' + props.index}
                    large={true}
                    style={{ marginTop: 5, marginLeft: 5}}
                    checked={props.value}
                    onChange={this.handleChange}
                    />
            }, {
                Header: 'Status',
                width: 60,
                accessor: 'status',
                Cell: cellRendererStatus
            }
        ]
        return (
            <div>
                <ButtonGroup>
                    <Tooltip
                    content="Run selected actions one at a time."
                    hoverOpenDelay={500}
                    >
                        <Button
                        text="Serial Run"
                        onClick={this.runSerial}
                        icon="play"
                        minimal={true}
                        intent={Intent.SUCCESS}
                        />
                    </Tooltip> 
                    <Tooltip 
                    content="Run selected actions at the same time."
                    hoverOpenDelay={500}
                    >
                        <Button
                        text="Parallel Run"
                        onClick={this.runParallel}
                        icon="double-chevron-right"
                        minimal={true}
                        intent={Intent.SUCCESS}
                        />
                    </Tooltip>
                    <Button 
                    text='Reset'
                    onClick={this.clearTable}
                    icon="refresh"
                    minimal={true}
                    intent={Intent.WARNING}
                    />
                    <AddScriptButtonSimple 
                    onInputChange={this.addScript}
                    fill={true}
                    />
                </ButtonGroup>
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
            </div>
        );
    }
}

export default ScriptTable;