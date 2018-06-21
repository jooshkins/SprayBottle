import React from 'react'
import { FileInput, Intent, RadioGroup, Radio } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import FolderSelectorPath from './FolderSelectorPath.js';

const Store = window.require('electron-store');
const store = new Store();

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scriptPath: store.get('scriptPath'),
            docPath: store.get('docPath'),
            radioValue: store.get('mode')
        }

        if (this.state.radioValue == undefined) {
            this.setState({radioValue: 'admin'})
        }

        this.handleChangeBrowseScript = this.handleChangeBrowseScript.bind(this);
        this.handleChangeTxtScript = this.handleChangeTxtScript.bind(this)
        this.handleClickScript = this.handleClickScript.bind(this)

        this.handleChangeBrowseDoc = this.handleChangeBrowseDoc.bind(this);
        this.handleChangeTxtDoc = this.handleChangeTxtDoc.bind(this)
        this.handleClickDoc = this.handleClickDoc.bind(this)

        this.handleRadioChange = this.handleRadioChange.bind(this)
    }

    handleRadioChange(event) {
        this.setState({radioValue: event.currentTarget.value})
        store.set('mode', event.currentTarget.value)
        store.delete('scripts'); // delete scripts object
        store.delete('scriptPathMTime') // delete folder modify time
    }

    handleChangeBrowseScript(event) {
        if (event.target.files.length > 0) {
            this.setState({ scriptPath: event.target.files[0].path })
        }
    }
    handleChangeTxtScript(event) {
        this.setState({ scriptPath: event.target.value })
    }
    handleClickScript(event) {
        store.set('scriptPath', this.state.scriptPath);
        store.delete('scripts'); // delete scripts object
        store.delete('scriptPathMTime') // delete folder modify time
    }

    handleChangeBrowseDoc(event) {
        if (event.target.files.length > 0) {
            this.setState({ docPath: event.target.files[0].path })
        }
    }
    handleChangeTxtDoc(event) {
        this.setState({ docPath: event.target.value })
    }
    handleClickDoc(event) {
        store.set('docPath', this.state.docPath);
    }

    render() {
        return (
            <div className="pt-dialog-body">
                <FolderSelectorPath
                    label="Scripts Folder:"
                    path={this.state.scriptPath}
                    onChangeTxt={this.handleChangeTxtScript}
                    onChangeBrowse={this.handleChangeBrowseScript}
                    onClick={this.handleClickScript}
                />
                <FolderSelectorPath
                    label="Document Folder:"
                    path={this.state.docPath}
                    onChangeTxt={this.handleChangeTxtDoc}
                    onChangeBrowse={this.handleChangeBrowseDoc}
                    onClick={this.handleClickDoc}
                />
                <hr />
                <RadioGroup
                    label="App Mode"
                    onChange={this.handleRadioChange}
                    selectedValue={this.state.radioValue}
                    inline={true}
                >
                    <Radio label="Admin" value="admin" large={true} />
                    <Radio label="Simple" value="simple" large={true} />
                </RadioGroup>
            </div>
        );
    }
}

export default Settings;