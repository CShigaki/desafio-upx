import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import Input from './Input';
import Textarea from './Textarea';

export default class SurveyCreation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.numberOfOptions = 0;
    this.state.options = [<div className="form-group option-container" data-order={this.state.numberOfOptions}><Input fieldType={`text`} fieldLabel={`Option 1`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>];
    this.state.errorMessage = undefined;
    this.state.numberOfOptions++;
  }

  validateMandatoryTextField(event) {
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
    options.push(<div className="form-group option-container" data-order={numberOfOptions}><span className="remove-field" onClick={this.removeOption.bind(this)}>X</span><Input fieldType={`text`} fieldLabel={`Option ${numberOfOptions + 1}`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>);
    numberOfOptions++;
    options = this.reorderData(options);
    this.setState({ numberOfOptions: numberOfOptions, options: options });
  }

  removeOption(event) {
    var numberOfOptions = this.state.numberOfOptions;
    var options = this.state.options;
    numberOfOptions--;
    options.pop();
    options = this.reorderData(options);
    this.setState({ numberOfOptions: numberOfOptions, options: options});
  }

  createSurvey(event) {
    var self = this;
    event.preventDefault();
    event.stopPropagation();

    var surveyQuestion = document.getElementById('survey-question').value.trim();
    var surveyDescription = document.getElementById('survey-description').value.trim();
    var choices = new Array();

    var surveyJson = {
      "question": surveyQuestion,
      "description": surveyDescription,
      "choices": choices,
    };
    
    var options = document.querySelectorAll(".option-container input");
    for (var i = 0; i < options.length; i++) {
      surveyJson.choices.push(options[i].value)
    }

    var options = {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([surveyJson]),
    };
    fetch('/api/v1/save/', options)
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      if (result.success)
        browserHistory.push('/app/thank-you');
      else
        self.setState({
          errorMessage: result.errorMessage,
        });
    });
  }

  reorderData(array) {
    var index = 0;
    for (var key in array) {
      if (index < array.length - 1) {
        array[key] = <div className="form-group option-container" data-order={array.length - 1}><Input fieldType={`text`} fieldLabel={`Option ${index + 1}`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>;
      } else {
        if (array.length > 1)
          array[key] = <div className="form-group option-container" data-order={index}><span className="remove-field" onClick={this.removeOption.bind(this)}>X</span><Input fieldType={`text`} fieldLabel={`Option ${index + 1}`} validate={this.validateMandatoryTextField} errorMessage={`This field cannot be blank!`} /></div>;
      }
      index++;
    }
    return array;
  }

  render() {
    var self = this;
    return(
      <form>
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
            <input className="btn btn-primary" type={`submit`} value={`Create Survey`} id={`create-survey`} onClick={self.createSurvey.bind(this)}/>
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