import React from 'react'
import { TextArea, Label, Button, Alignment } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import './style.css';

class ConsoleLog extends React.Component {
    render() {
        return (
            <div>
                <Label text="Console">
                <Button text="Clear Console" style={{float: "right"}}/>
                    <TextArea
                            fill={true}
                            readOnly={true}
                            onChange={this.handleChange}
                    />
                </Label>
            </div>
        );
    }
}

export default ConsoleLog;