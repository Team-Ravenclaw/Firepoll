import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import CreatedQuestions from './createdQuestions.jsx';
import axios from 'axios';
import firestore from '../firepollManagementClient';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pollname: '',
      questions: [],
      currentQuestion: '',
      currentAnswer: '',
      answers: []
    };
 }

  createPoll = () => {
    console.log('creating Poll: ', this.state.pollname);
    let poll = {
      author: this.props.userId,
      title: this.state.pollname,
      active: false,
      completed: false,
      num_questions: this.state.questions.length,
      total_answers: 0,
      winning_response: null,
      start_time: null,
      questions: this.state.questions
    }
    
    //  adding poll to MongoDB
    axios.post('/polls/', poll)
    .then(res => {
      console.log('saved: ', res);
      firestore.stage(res.data._id, () => {
        this.setState({
          pollname: '',
          questions: [],
          currentQuestion: '',
          currentAnswer: '',
          answers: []
        })
        //then redirect to dashboard
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  addQuestion = () => {
    var newQuestion = {
      question: this.state.currentQuestion,
      answers: this.state.answers,
      question_type: "multiple-choice",
      total_voting_time: 10000
    }
    var allQuestions = this.state.questions;
    allQuestions.push(newQuestion);
    this.setState({
      answers: [],
      currentQuestion: '',
      currentAnswer: '',
      questions: allQuestions
    })
  }
  
  addAnswer = (e) => {
    e.preventDefault();
    let newAnswerArray = this.state.answers;
    newAnswerArray.push({
      choice: this.state.currentAnswer,
      responders: [],
      votes: 0
    });
    this.setState({
      answers: newAnswerArray,
      currentAnswer: ''
    })
  }

  deleteAnswer = (e) => {
    let i = parseInt(e.target.id);
    this.setState(prevState => {
      prevState.answers.splice(i, 1)
      return {answers: prevState.answers}
    })
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    if (this.props.user === 'anonymous') return <Redirect to='/login' />
      return (
        <div>
          {/*NAVBAR*/}
          <div className="topnav">
            <Link to="/dashboard"><button>Dashboard</button></Link>
            <button onClick={() => this.props.logout()}>Log Out</button>
          </div>
          {/*HEADER*/}
          <h1>Create Your Poll!</h1>
          <div className="nav">
          <h2>Logged in as {this.props.user}</h2>
          </div>
          <div id="create-poll">
            <label className="label">Poll Title:</label>
            <div className="control">
              <input className="input" type="text" id="pollname" value={this.state.pollname} onChange={this.handleChange} placeholder="Name your poll"/>
            </div>
          </div>
          {/*NEW QUESTION*/}
          <div className="new-question box">
            <div>Question #{this.state.questions.length + 1}</div>
            <div className="field">
              <div className="control">
                <input className="input" type="text" id="currentQuestion" value={this.state.currentQuestion} onChange={this.handleChange} placeholder="Type your question here" />
              </div>
            </div>
            {/*CURRENT ANSWERS*/}
            {this.state.answers.length > 0 &&
              this.state.answers.map((answer, i) => {
                return (<li className="answer"><span>{answer.choice}</span><button id={i.toString()} onClick={this.deleteAnswer}>delete</button></li>)
              })
            }
            <form onSubmit={this.addAnswer} className="field">
              <div className="control">
                <input className="input" type="text" id="currentAnswer"  value={this.state.currentAnswer} onChange={this.handleChange} placeholder="Type answer here to automatically add answer" />
              </div>
            </form>
            <div className="addQuestionWrapper">
              <button onClick={this.addQuestion}>Add Question</button>
            </div>
          </div>
          {/*SIDE ELEMENT CREATED QUESTIONS*/}
          <CreatedQuestions questions={this.state.questions}/>
          <div id="createPollButtonWrapper">
            <button onClick={this.createPoll}>Create Poll</button>
          </div>
        </div>
      )
  }
}

export default Create;