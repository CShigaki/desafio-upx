import React from 'react';
import { Link } from 'react-router';
import SurveyDetails from './SurveyDetails';

export default class SurveyListing extends React.Component {
  constructor(props) {
    super(props);
    // Defines the initial state variables.
    this.state = { surveys: {}, errorMessage: undefined }
  }

  componentDidMount() {
    // This is going to be executed after the component is mounted.
    var self = this;
    // Do a POST request to the listing API.
    fetch('/api/v1/list/').then(function(response){
      return response.json().then(function(json) {
        // Read the response as directly as JSON (since we know the api will ALWAYS return JSON).
        // Sets the state according to the returned JSON.
        console.log(json);
        if (json.errorMessage != undefined)
          self.setState({ surveys: {}, errorMessage: json.errorMessage })
        else
          self.setState({ surveys: json, errorMessage: undefined });
      });
    });
  }

  render() {
    var links = [];
    for (var i = 0; i < this.state.surveys.length; i++) {
      // Add the survey links to the array.
      links.push(<li><Link to={`/app/survey-detail/${this.state.surveys[i].id}`}>
        {this.state.surveys[i].question}
      </Link></li>);
    }

    return(
      // Render the survey links added to the array.
      <div className="survey-listing-container">
        <h2>Available Surveys</h2>
        {links.length != 0 ? <ul className="survey-listing">{links}</ul> : <p>{this.state.errorMessage != undefined ? this.state.errorMessage : 'Loading surveys...'}</p>}
      </div>
    );
  }
}