#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Groove</bitbar.title>
// <bitbar.version>v1.0</bitbar.version>
// <bitbar.author>Paul Griffiths</bitbar.author>
// <bitbar.author.github>plushgraffiti</bitbar.author.github>
// <bitbar.desc>Ticket status from Groove</bitbar.desc>
// <bitbar.dependencies>node.js</bitbar.dependencies>

var https = require('https');
var api_key = 'API_KEY_GOES_HERE'
var url = "https://api.groovehq.com/v1/tickets?state=unread,opened,pending&access_token=" + api_key

// Disable plugin reporting
var disabled = false;

function status(result) {
  if (result === 'unread') {
    return '⚠ ';
  } else if (result === 'opened') {
    return '♨ ';
  } else {
  	return '◷ ';
	}
}

function color(result) {
  if (result === 'unread') {
    return 'red';
  } else if (result === 'opened') {
    return 'orange';
  } else {
		return 'black';
	}
}

function report(ticket){
	return "\n" + timeSince(ticket.updated_at) + ' - ' + ticket.summary + " | length=50";
}

function statusIcon(states) {
	if (disabled == true) {
		return "Gr | color=gray font=Helvetica-Bold size=16"
	}

	if (states.indexOf("unread") >= 0) {
		return "Gr | color=red font=Helvetica-Bold size=16"
	} else if (states.indexOf("opened") >= 0) {
		return "Gr | color=orange font=Helvetica-Bold size=16"
	} else {
		return "Gr | color=black font=Helvetica-Bold size=16"
	}
}

function timeSince(timeStamp) {
	// Expects timeStamp as a string, similar to: 2016-02-17T16:12:39Z
	var timeStamp = new Date(Date.parse(timeStamp));
  var now = new Date(),
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
  if(secondsPast < 60){
    return parseInt(secondsPast) + 's';
  }
  if(secondsPast < 3600){
    return parseInt(secondsPast/60) + 'm';
  }
  if(secondsPast <= 86400){
    return parseInt(secondsPast/3600) + 'h';
  }
  if(secondsPast > 86400){
    day = timeStamp.getDate();
    month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
    year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
    return day + " " + month + year;
  }
}

function handleResponse(body) {
	var states = [];
	var output = '';
	if (disabled == false) {
		var old_state = '';
	  var output = body.tickets.map(function(ticket){
			states.push(ticket.state)
			var spacer = (ticket.state == old_state) ? '' : '\n---\n';
			old_state = ticket.state
			return [spacer, status(ticket.state), ticket.title, ' | color=', color(ticket.state), ' length=50 href=https://getapp.groovehq.com/t/' + ticket.number, report(ticket)].join('');
	  }).join('\n');
	}
  console.log(statusIcon(states) + '\n---\n' + output);
}

https.get(url, function(res) {
  var body = ''
  res.on('data', function(data) {
    body += data;
  });
  res.on('end', function() {
    handleResponse(JSON.parse(body));
  });
});
