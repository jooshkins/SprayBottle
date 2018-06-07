import React from 'react'
import { Tab, Tabs, TabId, Navbar, Alignment, Icon, Button } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';

import ScriptTable from './ScriptTable';
import ScriptTableSimple from './ScriptTableSimple';
import DocumentButtons from './DocumentButtons';
import Settings from './Settings';

const Store = window.require('electron-store');
const store = new Store();

const selectTable = () => {
    if (store.get('mode') == 'simple') {
        return <ScriptTableSimple />
    }
    else {
        return <ScriptTable />
    }
}

class NavTabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navebarTabId: 'Actions',
            panel: selectTable(),
        };
    }

    handleNavbarTabChange = (navbarTabId) => {        
        switch(navbarTabId) {
            case 'Actions':
                this.setState({panel: selectTable()})
            break;

            case 'Info':
                this.setState({ panel: <DocumentButtons /> });
            break;

            case 'Settings':
                this.setState({ panel: <Settings /> });
        }
    }

    render() {
        return (
            <div>
                <Navbar>
                    <Navbar.Group>
                        <Tabs
                            animate={this.state.animate}
                            id="navbar"
                            large={true}
                            onChange={this.handleNavbarTabChange}
                            selectedTabId={this.state.navbarTabId}
                        >
                            <Tab id="Actions" title={<Button text="Actions" minimal={true} icon="code"/>}  />
                            <Tab id="Info" title={<Button text="Info" minimal={true} icon="document" />} />
                            <Tab id="Settings" title={<Button text="Settings" minimal={true} icon="cog" />} />
                        </Tabs>
                    </Navbar.Group>
                </Navbar>
                {this.state.panel}
            </div>
        );
    }
}

export default NavTabs;