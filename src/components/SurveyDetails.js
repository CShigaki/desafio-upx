import React from 'react'
import SurveyDetailsFields from './SurveyDetailsFields'

export default class SurveyDetails extends React.Component {
  constructor(props) {
    super(props);
    // Defines the initial state variables.
    this.state = { survey: {}, errorMessage: undefined };
  }

  componentDidMount() {
    // This is going to be executed after the component is mounted.
    var self = this;
    // Do a POST request to the single post API.
    fetch('/api/v1/get/'+ self.props.params.id).then(function(response){
      return response.json().then(function(json) {
        // Read the response as directly as JSON (since we know the api will ALWAYS return JSON).
        // Sets the state according to the returned JSON.
        if (json.errorMessage != undefined)
          self.setState({ survey: {}, errorMessage: json.errorMessage });
        else
          self.setState({ survey: json, errorMessage: undefined });
      });
    });
  }

  render() {
    var self = this;
    return (
      self.state.survey.id ? <SurveyDetailsFields surveyId={self.props.params.id} question={self.state.survey.question} description={self.state.survey.description} choices={self.state.survey.choices} /> : <p>{this.state.errorMessage ? this.state.errorMessage : 'Loading Surveys...'}</p>
    );
  }
}