import React from 'react'
import {Button, Intent} from "@blueprintjs/core";
import  '@blueprintjs/core/lib/css/blueprint.css';

class ScriptButton extends React.Component {
    render () {
        return (
            <Button 
                icon="play" 
                intent={Intent.PRIMARY} 
                minimal={true} 
                onClick={this.props.onClick} 
            />
        );
    }
}

export default ScriptButton;