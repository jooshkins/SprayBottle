import React from 'react'
import { Icon, Popover, Spinner, Button } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import './style.css'

class ScriptStatus extends React.Component {
    
    render() {
    let content = <div className="toolTip"><pre>{this.props.content}</pre></div>
        if (this.props.mode === 'icon') {
            return (
                <Popover content={content}>
                    <Button
                    minimal={true}
                    intent={this.props.intent}
                    >
                        <Icon
                            icon={this.props.icon}
                            iconSize={20}
                            intent={this.props.intent}
                        />
                    </Button>
                </Popover>
            );
        }
        if (this.props.mode === 'spinner') {
            return (
                <Popover content={content}>
                    <Button
                    minimal={true}
                    intent={this.props.intent}
                    >
                        <Spinner
                            small={true}
                            className="m-10"
                        />
                    </Button>
                </Popover>            
            );
        }
    }
}

export default ScriptStatus;