import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import CreatedQuestions from './createdQuestions.jsx';
import axios from 'axios';
import {firepoll} from '../firepollManagementClient';
import { EIO } from 'constants';
import Navbar from './navbar';

class Create2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pollname: '',
      questions: [],
      currentQuestion: '',
      currentAnswer: '',
      answers: [],
      invalid: false,
    };
 }
  componentDidMount() {
    let editPollId = this.props.match.params.pollId;
    if (editPollId) {
      axios.get(`/polls/${editPollId}`)
      .then(res => {
        let {title, questions} = res.data;
        this.setState({pollname: title, questions});  //this breaks the page format
      })
      .catch(err => console.log(err));
    }
  }

  updateAnswer = (e, ansIdx, qIdx) => {
    this.state.questions[qIdx].answers[ansIdx].choice = e.target.innerHTML;
    this.forceUpdate();
  }

  updateQuestion = (e, qIdx) => {
    // console.log(e.target.innerHTML, qIdx);
    // // console.log(this.state.questions[qIdx].question);
    this.state.questions[qIdx].question = e.target.innerHTML;
    this.forceUpdate();
  }
  resetPoll = () => {
    this.setState({
      pollname: '',
      questions: [],
      currentQuestion: '',
      currentAnswer: '',
      answers: []
    });
  }

  createPoll = () => {
    let editPollId = this.props.match.params.pollId;
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

    if (editPollId) {
      axios.put(`/polls/edit/${editPollId}`, poll)
        .then(res => this.props.returnToDash())
        .catch(err => console.error(err));
    } else if (this.state.pollname) {
      //  adding poll to MongoDB
      axios.post('/polls/', poll)
      .then(res => {
        console.log('saved: ', res);
        firepoll.stage(res.data._id, () => {
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
    } else {
      this.setState({
        invalid: true
      }, setTimeout(() => {
        this.setState({
          invalid: false
        });
      }, 3000));
    }
  }

  addQuestion = () => {
    if (this.state.currentQuestion && this.state.answers.length !== 0) {
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
      });
    } else {
      this.setState({
        invalid: true
      }, setTimeout(() => {
        this.setState({
          invalid: false
        });
      }, 3000));
    }
  }
  
  addAnswer = (e) => {
    e.preventDefault();
    if (this.state.currentAnswer) {
      let newAnswerArray = this.state.answers;
      newAnswerArray.push({
        choice: this.state.currentAnswer,
        responders: [],
        votes: 0
      });
      this.setState({
        answers: newAnswerArray,
        currentAnswer: ''
      });
    } else {
      this.setState({
        invalid: true
      }, setTimeout(() => {
        this.setState({
          invalid: false
        });
      }, 3000));
    }
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

  deleteQuestion = (i) => {
    // console.log('deleting question', i);
    // console.log(this.state.questions[i]);
    let questions = this.state.questions;
    // console.log('preslice qs', questions);
    questions.splice(i, 1);
    // console.log('post slice qs', questions);
    this.setState({questions});

  }

  render() {
    let pathurl = this.props.location.pathname;
   // if (this.props.user === null) return <Redirect to='/login' />
      return (
        <div className="create-view">
          <div className="container">
            <Navbar />
            <main className="create-view__content">
              <div className="create-poll">
                <div className="title">
                  Create a new poll!
                </div>
                <div className="poll-form">
                  <label className="form-label"><i className="fa-fw far fa-question-circle"></i> Question #{this.state.questions.length + 1}</label>
                  <input type="text" className="form-input" placeholder="Give your poll a name"/>
                  <label className="form-label">Poll Title</label>
                  <input type="text" className="form-input" id="currentQuestion" value={this.state.currentQuestion} onChange={this.handleChange} placeholder="Type your question here"/>

                </div>
              </div>
              <div className="questions">
                Questions
              </div>
            </main>
          </div>
        </div>
      )
  }
}

export default Create2;