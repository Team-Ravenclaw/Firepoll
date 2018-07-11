import React from 'react';
import { Redirect } from 'react-router-dom';
import AnalyticsSub from './analyticsSub';
import axios from 'axios';
import Navbar from './navbar';
// import Navbar from './navbar';

class Analytics extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {
      poll: {},
      questions: []
    }
  }
  
  componentDidMount() {
    axios.get(`/polls/${this.props.match.params.id}`)
    .then(res => {
      this.setState({
        poll: res.data,
        questions: res.data.questions
      });
    });
    
    // const createPie(divId, ) {

    // }
var pie = new d3pie("pieChart", {
	"header": {
		"title": {
			"text": "Poll Votes",
			"fontSize": 24,
			"font": "open sans"
		},
		"subtitle": {
			"color": "#999999",
			"fontSize": 12,
			"font": "open sans"
		},
		"location": "pie-center",
		"titleSubtitlePadding": 9
	},
	"footer": {
		"color": "#999999",
		"fontSize": 10,
		"font": "open sans",
		"location": "bottom-left"
	},
	"size": {
		"pieInnerRadius": "50%",
		"pieOuterRadius": "70%"
	},
	"data": {
		"sortOrder": "value-desc",
		"content": [
			{
				"label": "Vote5",
				"value": 32170,
				"color": "#f80000"
			},
			{
				"label": "Vote4",
				"value": 32170,
				"color": "#fd938d"
			},
			{
				"label": "Vote3",
				"value": 36344,
				"color": "#cb1b0e"
			},
			{
				"label": "Vote2",
				"value": 67706,
				"color": "#a94545"
			},
			{
				"label": "Vote1",
				"value": 78327,
				"color": "#7a0b03"
			}
		]
	},
	"labels": {
		"outer": {
			"format": "label-value1",
			"pieDistance": 32
		},
		"inner": {
			"hideWhenLessThanPercentage": 3
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#ffffff",
			"decimalPlaces": 0
		},
		"value": {
			"color": "#adadad",
			"fontSize": 11
		},
		"lines": {
			"enabled": true
		},
		"truncation": {
			"enabled": true
		}
	},
	"tooltips": {
		"enabled": true,
		"type": "placeholder",
		"string": "{label}: {percentage}%",
		"styles": {
			"fadeInSpeed": 348
		}
	},
	"effects": {
		"pullOutSegmentOnClick": {
			"speed": 400,
			"size": 8
		}
	},
	"misc": {
		"gradient": {
			"enabled": true,
			"percentage": 100
		}
	},
	"callbacks": {}
});

  }
  render() {
    return (
      <div>
        <div id="pieChart"></div>
        <Navbar logout={this.props.logout}/>
        <AnalyticsSub questions={this.state.questions}/>
      </div>
    )
  }
}



export default Analytics;