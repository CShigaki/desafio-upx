import React from 'react';
import { Link } from 'react-router';

export default class Layout extends React.Component {
  render() {
    return(
      <div className="app-container">
        <header className="header-menu">
          <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
            <div className="container">
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="nav navbar-nav">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/app/list-surveys">List Surveys</Link>
                  </li>
                  <li>
                    <Link to="/app/create-survey">Create Survey</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>
        <div className="app-content container">
          {this.props.children}
        </div>

        <footer>
          
        </footer>
      </div>
    );
  }
}