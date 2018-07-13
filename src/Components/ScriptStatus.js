import React from 'react'
import { Icon, Tooltip, Spinner } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import './style.css'

class ScriptStatus extends React.Component {
    render() {
        if (this.props.mode === 'icon') {
            return (
                <Tooltip content={this.props.content}>
                    <Icon
                        icon={this.props.icon}
                        iconSize={20}
                        intent={this.props.intent}
                    />
                </Tooltip>
            );
        }
        if (this.props.mode === 'spinner') {
            return (
                <Tooltip content={this.props.content}>
                    <Spinner
                        small={true}
                        className="m-10"
                    />
                </Tooltip>
            );
        }
    }
}

export default ScriptStatus;