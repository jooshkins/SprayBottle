import React from 'react'
import { AnchorButton, ButtonGroup, Alignment } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';

const fs = window.require("fs");
const Store = window.require('electron-store');
const store = new Store();
const isMac = window.require("process").platform === "darwin" ? 'file://' : '';


const CheckIfFile = (file) => {
    return file.match(/.+\.\b/);
}

class DocumentButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            docs: '',
            docPath: store.get('docPath')
        }

        if (this.state.docPath !== undefined){
            fs.readdir(this.state.docPath, (err, dir) => {
                if (dir !== undefined) {
                    let files = dir.filter(CheckIfFile);
                    this.setState({docs: files})
                }
            });
        }
    };

    render() {
        let docList = this.state.docs.length > 0 ?
        this.state.docs.map((doc, i) => 
          <AnchorButton 
            icon="document"
            href={`${isMac}${this.state.docPath}/${doc}`}
            target="_blank"
            text={doc} 
            key={'doc_' + i}>
          </AnchorButton>
          ) : <div>No Documents</div>
        return (
            <ButtonGroup 
            large={true} 
            minimal={true} 
            vertical={true}
            alignText={Alignment.LEFT}
            >
                {docList}
            </ButtonGroup>
        );
    }
}

export default DocumentButtons;