import React from 'react';
import { browserHistory } from 'react-router';

export default class SurveyDetailsFields extends React.Component {
  constructor(props) {
    super(props);
    // Sets the initial state.
    this.state = { voteErrorMessage: undefined, errorMessage: undefined };
  }

  // Set the state with the selected radio.
  setVote(event) {
    // When the user selects a radio button, we set the vote in the state.
    this.setState({
      "vote": {
        "id": this.props.surveyId,
        "choice": event.target.value,
      },
      "voteErrorMessage": undefined,
      "errorMessage": undefined,
    });
  }

  // Sends the request to the API.
  submitVote(event) {
    var self = this;
    // If the used didn't select any radio.
    if (self.state.vote == undefined) {
      self.setState({
        "voteErrorMessage": "Please select at least one option."
      });
    }
    else {
      // Set the post parameters.
      var options = {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([self.state.vote]),
      };
      // And make the request.
      fetch('/api/v1/vote/', options).then(function(response) {
        return response.json().then(function (result) {
          // If there was no problems with the request,
          if (result.success)
            browserHistory.push('/app/thank-you');

          // If there was a problem, set it to the state for display.
          self.setState({
            "voteErrorMessage": result.message
          });
        });
      });
    }
  }

  render() {
    var radioButtons = [];
    // Cycles through all the choices retrieved from the API.
    for (var option in this.props.choices) {
      // And insert them into the radio buttons array.
      // I'm inserting the numberOfVotes here for development purposes. Remove later.
      radioButtons.push(
        <p className="survey-option-parent">
          <input type="radio" name="survey-option" value={this.props.choices[option].value} key={`radio-${this.props.choices[option].value}`} className="survey-option" />{this.props.choices[option].choice}
          <span className="number-of-votes" key={`span-${this.props.choices[option].value}`}>{this.props.choices[option].votes}</span>
        </p>
      );
    }

    return(
      <div className="survey-details-item-container">
        <strong><p className="survey-details-item-title">{this.props.question}</p></strong>
        <p className="survey-details-item-description">{this.props.description}</p>

        <div className="survey-options" onChange={this.setVote.bind(this)}>
          {radioButtons}
        </div>
        <input className="btn btn-primary" type="button" id="survey-submit" value="Vote!" onClick={this.submitVote.bind(this)} />
        {this.state.errorMessage != undefined ? <p className="error-message">{this.state.errorMessage}</p> : ''}
        {this.state.voteErrorMessage != undefined ? <p className="error-message">{this.state.voteErrorMessage}</p> : ''}
      </div>
    );
  }
}
