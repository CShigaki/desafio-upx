import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import Input from './Input';
import Textarea from './Textarea';

export default class SurveyCreation extends React.Component {
  constructor(props) {
    super(props);
    // Initializes the variables necessary.
    this.state = {};
    this.state.numberOfOptions = 0;
    this.state.options = [<div className="form-group option-container" data-order={this.state.numberOfOptions}><Input fieldType={`text`} fieldLabel={`Option 1`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>];
    this.state.errorMessage = undefined;
    this.state.numberOfOptions++;
  }

  validateMandatoryTextField(event) {
    // Change event for all the fields.
    // Show an error to the used if he starts typing and then erases the text.
    if (event.target.value.trim().length == 0) {
      this.setState({
        error: true,
      });
    } else {
      this.setState({
        error: false,
      });
    }
  }

  addMoreOptions(event) {
    var options = this.state.options;
    var numberOfOptions = this.state.numberOfOptions;
    // Push another text field to the array of options.
    options.push(<div className="form-group option-container" data-order={numberOfOptions}><span className="remove-field" onClick={this.removeOption.bind(this)}>X</span><Input fieldType={`text`} fieldLabel={`Option ${numberOfOptions + 1}`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>);
    numberOfOptions++;
    // Sets the state array with the new values.
    this.setState({ numberOfOptions: numberOfOptions, options: options });
  }

  removeOption(event) {
    var numberOfOptions = this.state.numberOfOptions;
    var options = this.state.options;
    // Decreases the number of options.
    numberOfOptions--;
    // And pops the last one.
    options.pop();
    // And set the state.
    this.setState({ numberOfOptions: numberOfOptions, options: options});
  }

  createSurvey(event) {
    event.stopPropagation();
    event.preventDefault();
    // Assuming the user did not mess with the HTML, we don't need any client side validation.
    // If he did, leave it to the server.
    var self = this;
    // Gets the fields values.
    // TODO: FIND BETTER WAY TO GET THE VALUES.
    var surveyQuestion = document.getElementById('survey-question').value.trim();
    var surveyDescription = document.getElementById('survey-description').value.trim();
    var choices = new Array();

    var surveyJson = {
      "question": surveyQuestion,
      "description": surveyDescription,
      "choices": choices,
    };
    // Get the options values.
    var options = document.querySelectorAll(".option-container input");
    for (var i = 0; i < options.length; i++) {
      surveyJson.choices.push(options[i].value)
    }

    // Build the request.
    var options = {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([surveyJson]),
    };
    // And make the request.
    fetch('/api/v1/save/', options).then(function (response) {
      return response.json().then(function (result) {
        // Again, if the was no problem, send the user to the thank you page.
        if (result.success)
          browserHistory.push('/app/thank-you');
        else // Else, show the error.
          self.setState({
            errorMessage: result.errorMessage,
          });
      });
    });
  }

  render() {
    var self = this;
    // Draw the whole Survey creation form.
    return(
      <form id="survey-creation-form" onSubmit={self.createSurvey.bind(this)}>
        {self.state.errorMessage ? <h3 className="error-message">{self.state.errorMessage}</h3> : ''}
        <h2>Create Survey</h2>
        <div className="survey-creation">
          <div className="main-fields col-sm-6">
            <div className="form-group">
              <Input fieldType="text"
                     fieldLabel="Question"
                     fieldId="survey-question"
                     validate={self.validateMandatoryTextField}
                     errorMessage="This field cannot be blank!" />
            </div>
            <div className="form-group">
              <Textarea fieldLabel={`Description`}
                        fieldId={`survey-description`}
                        fieldCols={`50`}
                        fieldRows={`5`}
                        validate={self.validateMandatoryTextField}
                        errorMessage={`This field cannot be blank!`} />
            </div>
            <button type="submit" className="btn btn-primary" id="create-survey" >Create Survey</button>
          </div>

          <div className="option-fields col-sm-6">
            <div class="scrollable-option-list">
              {this.state.options}
            </div>
            <input className="btn btn-primary" type={`button`} value={`Add Option`} id={`add-option`} onClick={self.addMoreOptions.bind(this)}/>
          </div>
          
        </div>
      </form>
    );
  }
}