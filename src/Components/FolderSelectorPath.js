import React from 'react'
import {Button, FileInput, EditableText} from "@blueprintjs/core";
import  '@blueprintjs/core/lib/css/blueprint.css';

  class FolderSelectorPath extends React.Component {  
    render () {
      return (
        <div>
          <p>{this.props.label}</p>
            <label className="pt-button-group">
              <span className="pt-button pt-intent-primary"> Browse&hellip;
                  <FileInput 
                    style={{display: 'none'}} 
                    inputProps={{webkitdirectory: ""}} 
                    onChange={this.props.onChangeBrowse} 
                  />
              </span>
              <input 
                className="pt-input .modifier" 
                value={this.props.path} 
                type="text" 
                placeholder="Enter Path..." 
                dir="auto" 
                onChange={this.props.onChangeTxt} 
              />
              <Button onClick={this.props.onClick}>Apply</Button>
            </label>
        </div>
      );
    }
  }
  
  export default FolderSelectorPath;