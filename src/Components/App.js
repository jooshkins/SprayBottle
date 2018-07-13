import React, { Component } from 'react';
import { TitleBar } from './Titlebar/lib/index.js';
import { FocusStyleManager } from "@blueprintjs/core";

import NavTabs from './NavTabs.js';

import './style.css';
import './Titlebar/assets/style.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import  'bootstrap/dist/css/bootstrap.min.css';

var title = <p className="text-light" style={{padding: ".25rem"}}>SprayBottle</p>

FocusStyleManager.onlyShowFocusOnTabs(); // Turn off mouse select highlighting

class App extends Component {
  render() {
    return (
      <div className="wrapper pt-dark">
        <TitleBar icon={"./icon.png"} children={title} />
        <NavTabs />
      </div>
    );
  }
}

export default App;
