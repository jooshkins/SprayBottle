import React from 'react'
import { Button, FileInput } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';

const fs = window.require("fs");
const Store = window.require('electron-store');
const store = new Store();

const CheckIfFile = (file) => {
  return file.match(/.+\.\b/);
}

class FolderSelectorPath extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.label === "Document Folder:") {
      this.state = {
        path: store.get('docPath'),
      }
    }
    else {
      this.state = {
        path: store.get('scriptPath'),
      }
    }
    this.handleBrowse = this.handleBrowse.bind(this)
    this.handleTxt = this.handleTxt.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  handleTxt(event) {
    this.setState({ path: event.target.value })
  }

  handleBrowse(event) {
    if (event.target.files.length > 0) {
      this.setState({ path: event.target.files[0].path })
    }
  }

  handleClick() {
    if (this.props.label === "Document Folder:") {
      store.set('docPath', this.state.path);
    }
    else { // add warning if path has ^ & [] % in it. 
      var search = /[\^\[\]&%]/;
      if (search.test(this.state.path)) {
        alert('Path contains one of these invaild characters: ^ [ ] & %')
      } else {
        store.set('scriptPath', this.state.path);
        store.delete('scripts'); // delete scripts object
        store.delete('scriptPathMTime') // delete folder modify time

        fs.readdir(this.state.path, (err, dir) => {  // Count files
          if (dir !== undefined) { // if folder actually exists
            let files = dir.filter(CheckIfFile);
            store.set('numFiles', files.length);
          }
        });
      }
    }
  }

  render() {
    return (
      <div>
        <p>{this.props.label}</p>
        <label className={"pt-button-group " + this.props.fill}>
          <span className="pt-button pt-intent-primary"> Browse&hellip;
            <FileInput
              className="hide"
              inputProps={{ webkitdirectory: "" }}
              onChange={this.handleBrowse}
            />
          </span>
          <input
            className={"pt-input .modifier " + this.props.fill}
            value={this.state.path}
            type="text"
            placeholder="Enter Path..."
            dir="auto"
            onChange={this.handleTxt}
          />
          <Button onClick={this.handleClick}>Apply</Button>
        </label>
      </div>
    );
  }
}

export default FolderSelectorPath;