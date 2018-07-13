import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { Redirect, Link } from 'react-router-dom';
import Poll from './poll';
import axios from 'axios';
import { firepoll, realTimeDB } from '../firepollManagementClient';
import Navbar from './navbar';

if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#app');

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const sortByDateDescending = arr => {
  return arr.sort((a, b) => {
    if (a.timeMS < b.timeMS) return 1;
    else return -1;
  })
}

const destructurePoll = (poll) => { 
  var returnObj = {};
  returnObj.poll = {
    _id: poll._id,
    data: {
    author: poll.author,
    num_questions: poll.questions.length,
    start_time: "some Date",
    title: poll.title,
    winning_response: null
    }
  };

  let questions = poll.questions.map(question => {
    let answers = question.answers.map((answer, i) => {
      let answerObj = {
        id: answer._id,
        position: i + 1,
        value: answer.choice
      }
      return answerObj;
    })
    let obj = {
      answers: answers,
      display_results: true,
      num_responses: question.answers.length,
      question_title: question.question,
      total_voting_time: 10000,
      type: "multiple-choice"
    }
    let questionWrapper = {
      id: question._id,
      data: obj
    }
    return questionWrapper;
  })
  returnObj.questions = questions;
  return returnObj;
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allPolls: [],
      filteredPolls: [],
      userFilterInput: '',
      modalIsOpen: false,
      phoneNumbers: '',
      currentLink: null,
      signedIn: false
    }
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }
  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }
  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  sendTexts = () => {
    console.log('texting out links!', this.state.phoneNumbers, this.state.currentLink);
    let phoneNumber = this.state.phoneNumbers, link = this.state.currentLink;
    if (phoneNumber.length >= 10) {
      axios.post('/notifications', {link, phoneNumber})
      .then(data => {
        console.log(data);
        this.setState({phoneNumbers: ''});
      })
      .catch(err => console.log(err));
    }
  }

  setCurrentLink = currentLink => {
    this.setState({currentLink});
  }

  getPolls = () => {
    axios.get(`/polls/user/${this.props.userId}`)
    .then(res => {
      console.log('users polls: ', res.data);
      this.setState({allPolls: res.data, filteredPolls: res.data})
    })
    .catch(err => {
      console.error(err);
    })
  }
  
  // When componentDidMount runs the first time, the props are not set yet, so that our db call would fail
  // The interval is a VERY hacky solution to the problem
  componentDidMount() {
    console.log(this.props);
    var that = this;
    var interval = setInterval(() => {
      console.log('running interval');
      if(that.props.userId !== null) {
        that.getPolls();
        clearInterval(interval);
      }
    }, 200);
  }
  
  // THIS SHOULD RUN, BUT IT NEVER GETS RUN
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log('will receive props', this.props);
    //this.getPolls(this.props.userId);
  }
  
  close = (index) => {
    let poll = this.state.filteredPolls[index];
    axios.put(`/polls/close/${poll._id}`, poll)
    .then(res => {
      firepoll.close(poll);
      realTimeDB.ref(`/polls/${poll._id}`).remove()
      .catch(err => {
        console.error('deleting poll from realTimeDB', err)
      })
      console.log("closed poll ", poll.title);
      this.getPolls();
      console.log('Saved: ', res.data);
    })
    .catch(err => {
      console.error('Closing Poll: ', err);
    })
  }

  deploy = (index) => {
    // formats the poll
    var destructured = destructurePoll(this.state.filteredPolls[index]);
    console.log('destructured: ', destructured);
    // should send poll to firestore
    firepoll.run(destructured);
    // send db request to update poll to `active` = true,
    axios.put(`/polls/${destructured.poll._id}`, {active: true})
    .then(() => {
      console.log('updated ', destructured.poll.data.title);
    })
    .catch(err => {
      console.error('Updating poll in MongoDB to active:true :', err)
    });
    // should trigger a rerender of the polls
    this.setState((prevState, props) => {
      prevState.filteredPolls[index].active = true;
      return prevState;
    })
  }

  filterPolls = (active, completed) => {
    let filtered = this.state.allPolls.filter(poll => poll.completed === completed && poll.active === active);
    this.setState({filteredPolls: filtered});
  }

  deletePoll = id => {
    console.log('deleting poll that was created but not deployed! id:', id);
    // remove from mongo db
    axios.delete(`/polls/${id}`)
    .then(res => {
      this.getPolls();
      firepoll.unstage(pollId)
        .then(data => console.log(data))
        .catch(err => console.log(err));
    })
    .catch(err => {
      console.error(err);
    })
  }

  handleInput(e) {
    console.log(e.target.value);
    this.setState({
      userFilterInput: e.target.value
    })
  }

  render() {
    let { user, email } = this.props;
    if (!user) {
      setTimeout(() => {
        if (!this.props.user) {
          this.props.history.push('/login');
        }}, 2000);
      return (
        <div id = "dashboard">
          <div className = "loading-container">
            <svg className = "loader-rotate" height = "100" width = "100">
              <circle cx="50" cy="50" r="40" />
            </svg>
            <div className = "loading-text"></div>
          </div>
        </div>
        );
    } else if (this.props.user && !this.state.signedIn) {
      setTimeout(() => {
        this.setState({
          signedIn: true
        })}, 1510);
      return (
        <div id = "dashboard">
          <div className = "loading-container">
            <svg className = "loader-rotate" height = "100" width = "100">
              <circle cx="50" cy="50" r="40" />
            </svg>
            <div className = "loading-text"></div>
          </div>
        </div>
        );
    } else if (this.state.signedIn) {
      let pollDisplay = !this.state.filteredPolls.length ? <div className = "no-polls-message">No polls created, click the button below!</div> : <div id="filtered-polls">{this.state.filteredPolls.map((poll, i) => {
        if (poll.title.toLowerCase().indexOf(this.state.userFilterInput.toLowerCase()) !== -1) {
          return (<Poll key={i} index={i} poll={poll} close={this.close} deploy={this.deploy} deletePoll={this.deletePoll} openModal={this.openModal} setCurrentLink={this.setCurrentLink}/>);
        }
      })}</div>
      let modalStyles = {
        height: '50%',
        background: '$red',
        color: '$white',
      }
      return (
        <div id="dashboard">
          <div id="dash-banner">
            <div>
              <Navbar history = {this.props.history}/>
            </div>
            <div className="brand">
              <div><div className="welcome-message">Welcome <span>{user}</span>!</div>
            </div>
              <div id="navbar">
              </div>
            </div>
            <div className = "input-menu"> 
              <div className = "input-buttons-container">
                <button className="filter-button" onClick={() => this.setState({filteredPolls: this.state.allPolls})}>Show All Polls 	&nbsp;<i className="fa-fw fas fa-sync-alt"></i></button>
                <button className="filter-button" onClick={() => this.filterPolls(false, false)}>Show Only Undeployed &nbsp;<i className="fa-fw fas fa-rocket"></i></button>
                <button className="filter-button" onClick={() => this.filterPolls(true, false)}>Show Only Live 	&nbsp;<i className="fa-fw fas fa-fire"></i></button>
                <button className="filter-button" onClick={() => this.filterPolls(false, true)}>Show Only Completed 	&nbsp;<i className="fa-fw fas fa-calendar-check"></i></button>
              </div>
              <input className = 'filter-input' placeholder="Type to filter your polls by name" type="text" onChange = {e => this.handleInput(e)}></input>
            </div>
          </div>
            <div id="polls-container">
              <button onClick = {() => {this.props.history.push('/create')}} className = "create-poll-button">+</button>
              {pollDisplay}
            </div>
          <Modal style = {modalStyles} isOpen={this.state.modalIsOpen} onAfterOpen={this.afterOpenModal} onRequestClose={this.closeModal} style={customStyles} contentLabel="Example Modal">
            <button onClick={this.closeModal}>X</button>
            <h2 ref={subtitle => this.subtitle = subtitle}>Please input any numbers you'd like to text!</h2>
            <form id="text-polls-form" onSubmit={e => e.preventDefault()}>
              <textarea value={this.state.phoneNumbers} form="text-polls-form" cols="50" rows="5" placeholder="You may use comma-separated values (as in CSV sheet imports), starting with the area code." onChange={e => this.setState({phoneNumbers: e.target.value})} />
              <button type="submit" onClick={this.sendTexts}>Send Texts</button>
            </form>
          </Modal>
        </div>
      );
    }
  }
}

export default Dashboard;