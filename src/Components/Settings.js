import React from 'react'
import {RadioGroup, Radio, Checkbox, Label } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import FolderSelectorPath from './FolderSelectorPath.js';

const Store = window.require('electron-store');
const store = new Store();
const appVersion = window.require('electron').remote.app.getVersion()

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            radioValue: store.get('mode', 'admin'),
            bypassErr: store.get('bypassErr', false),
            bypassExecPolicy: store.get('bypassExecPolicy', false),
            runAsAdm: store.get('runAsAdm', false),
            clearOnStart: store.get('clearOnStart', false)
        }
    }

    handleRadioChange = (event) => {
        this.setState({radioValue: event.currentTarget.value})
        store.set('mode', event.currentTarget.value)
    }

    handleCheckBoxChange = (event) => {
        this.setState({[event.target.id]: event.target.checked})
        store.set(event.target.id, event.target.checked)
    }

    render() {
        return (
            <div className="pt-dialog-body">
                <FolderSelectorPath
                    label="Scripts Folder:"
                />
                <FolderSelectorPath
                    label="Document Folder:"
                />
                <hr />
                <RadioGroup
                    label="App Mode:"
                    onChange={this.handleRadioChange}
                    selectedValue={this.state.radioValue}
                    inline={true}
                >
                    <Radio label="Admin" value="admin" large={true} />
                    <Radio label="Simple" value="simple" large={true} />
                </RadioGroup>
                <hr />
                <Label>Action Defaults:</Label>
                <Checkbox 
                    checked={this.state.bypassErr} 
                    id='bypassErr' 
                    label="Continue on error" 
                    large={true} 
                    inline={true} 
                    onChange={this.handleCheckBoxChange}
                />
                <Checkbox 
                    checked={this.state.runAsAdm} 
                    id='runAsAdm' 
                    label="Run as admin" 
                    large={true} 
                    inline={true} 
                    onChange={this.handleCheckBoxChange}
                />
                <hr />
                <Label>Startup:</Label>
                <Checkbox 
                    checked={this.state.clearOnStart} 
                    id="clearOnStart" 
                    label="Clear table when application starts" 
                    large={true} 
                    inline={true} 
                    onChange={this.handleCheckBoxChange}
                />
                <hr />
                <div>App Version: {appVersion}</div>
            </div>
        );
    }
}

export default Settings;