import React from 'react'
import {RadioGroup, Radio } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import FolderSelectorPath from './FolderSelectorPath.js';

const Store = window.require('electron-store');
const store = new Store();

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            radioValue: store.get('mode')
        }
        if (this.state.radioValue === undefined) {
            this.setState({radioValue: 'admin'})
        }
        this.handleRadioChange = this.handleRadioChange.bind(this)
    }

    handleRadioChange(event) {
        this.setState({radioValue: event.currentTarget.value})
        store.set('mode', event.currentTarget.value)
        store.delete('scripts'); // delete scripts object
        store.delete('scriptPathMTime') // delete folder modify time
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