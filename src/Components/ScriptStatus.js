import React from 'react'
import { Intent, Alignment, Icon, Tooltip, Position, Spinner } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';

class ScriptStatus extends React.Component {
    render() {
        if (this.props.mode == 'icon') {
            return (
                <Tooltip content={this.props.content}>
                    <Icon
                        icon={this.props.icon}
                        iconSize={20}
                        intent={this.props.intent}
                        style={{ margin: 10 }}
                    />
                </Tooltip>
            );
        }
        if (this.props.mode == 'spinner') {
            return (
                <Tooltip content={this.props.content}>
                    <Spinner
                        small={true}
                        style={{ margin: 10 }}
                    />
                </Tooltip>
            );
        }
    }
}

export default ScriptStatus;