import React from 'react'
import { Tab, Tabs, Navbar, Button } from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import ScriptTable from './ScriptTable';
import DocumentButtons from './DocumentButtons';
import Settings from './Settings';  

class NavTabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navebarTabId: 'Actions',
            panel: <ScriptTable/>,
        };
    }

    handleNavbarTabChange = (navbarTabId) => {        
        switch(navbarTabId) {
            case 'Actions':
                this.setState({panel: <ScriptTable/>})
            break;

            case 'Info':
                this.setState({ panel: <DocumentButtons /> });
            break;

            case 'Settings':
                this.setState({ panel: <Settings /> });
                break;
            default:
                this.setState({panel: <ScriptTable/>});
        }
    }

    render() {
        return (
            <div>
                <Navbar fixedToTop={false}>
                    <Navbar.Group>
                        <Tabs
                            animate={this.state.animate}
                            id="navbar"
                            large={true}
                            onChange={this.handleNavbarTabChange}
                            selectedTabId={this.state.navbarTabId}
                            renderActiveTabPanelOnly={true}
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