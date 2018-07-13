import React from 'react'
import {FileInput} from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';

class AddScriptButtonSimple extends React.Component {
    render() {
        return (
            <div>
                <label className={"pt-button-group " + this.props.fill} style={{margin: 0}}>
                    <span className="pt-button pt-minimal pt-intent-primary pt-icon-add"> Script
                        <FileInput
                            className="hide"
                            onInputChange={this.props.onInputChange}
                        />
                    </span>
                </label>
            </div>
        );
    }
}

export default AddScriptButtonSimple;