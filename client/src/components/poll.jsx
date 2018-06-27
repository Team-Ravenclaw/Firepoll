import React from 'react';
import { Link } from 'react-router-dom';

const Poll = (props) => {
  let {poll} = props;
  let deployButton = (<button onClick={() => props.deploy(poll.pollId)}>DEPLOY</button>);
  let liveButton = (<Link to="/live"><button>VIEW LIVE</button></Link>);
  let analyticsButton = (<Link to="/analytics"><button>VIEW ANALYTICS</button></Link>);
  let status = !poll.staged ? 'DEPLOY' : poll.complete ? 'VIEW ANALYTICS' : 'VIEW LIVE';
  let statusButton = !poll.staged ? deployButton : poll.complete ? analyticsButton : liveButton;
  return (
    <div>
      <div>
        <h1>{poll.title}</h1>
        {/* <button>{status}</button> */}
        {statusButton}
      </div>
      <div className="questions-box">
        {poll.questions.map(question => <p key={question.questionId}>{question.question}</p>)}
      </div>
    </div>
  )
}

export default Poll;