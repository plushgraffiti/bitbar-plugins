#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Pingdom</bitbar.title>
// <bitbar.version>v1.0</bitbar.version>
// <bitbar.author>Paul Griffiths</bitbar.author>
// <bitbar.author.github>plushgraffiti</bitbar.author.github>
// <bitbar.desc>Check status from Pingdom</bitbar.desc>
// <bitbar.dependencies>node.js</bitbar.dependencies>

var https = require('https');

// Pingdom credentials go here
var user = 'ACCOUNT_USER_GOES_HERE'
var pass = 'ACCOUNT_PASSWORD_GOES_HERE'
var app_key = 'APP KEY GOES HERE'

var auth = "Basic " + new Buffer.from(user + ":" + pass).toString("base64");
var options = {
  host: 'api.pingdom.com',
  port: 443,
  path: '/api/2.0/checks',
  method: 'GET',
  headers: { 'App-Key': app_key, 'Authorization': auth }
};

// Do you want to filter by domain?
var filter_by_host = false;
// Add domain to filter here
var hostname_filter = 'www.mysite.com'

function status(result) {
  if (result === 'up') {
    return '☺ ';
  } else if (result === 'down') {
    return '☹ ';
  } else {
    return '? ';
  }
}

function color(result) {
  if (result === 'up') {
    return 'green';
  } else if (result === 'down') {
    return 'red';
  } else {
    return 'orange';
  }
}

function report(check) {
  return "\nDown last: " + timeSince(new Date(check.lasterrortime*1000)) + " - Last test: " + timeSince(new Date(check.lasttesttime*1000)) + "\n"
}

function timeSince(timeStamp) {
  var now = new Date(), secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
  if (secondsPast < 60) {
    return parseInt(secondsPast) + 's';
  }
  if (secondsPast < 3600) {
    return parseInt(secondsPast/60) + 'm';
  }
  if (secondsPast <= 86400) {
    return parseInt(secondsPast/3600) + 'h';
  }
  if (secondsPast > 86400) {
    day = timeStamp.getDate();
    month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
    year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
    return day + " " + month + year;
  }
}

function statusIcon(statuses) {
  if (statuses.indexOf("down") >= 0) {
    return "Pi | color=red font=Helvetica-Bold size=16"
  } else if (statuses.indexOf("unknown") >= 0) {
    return "Pi | color=orange font=Helvetica-Bold size=16"
  } else {
    return "Pi | color=black font=Helvetica-Bold size=16"
  }
}

function report_url(id) {
  return "https://my.pingdom.com/reports/uptime#check=" + id + "&tab=uptime_tab&daterange=7days"
}

function handleResponse(body) {
  var statuses = [];
  // Sort by hostname for some presentation order
  body.checks.sort(function(a, b) {
    return a.hostname == b.hostname ? 0 : +(a.hostname > b.hostname) || -1;
  });
  var old_hostname = '';
  var output = body.checks.map(function(check) {
    if (filter_by_host === true) {
      if (check.hostname.indexOf(hostname_filter) > -1) {
        statuses.push(check.status)
        // Draw a line to separate checks by hostname
        var spacer = (check.hostname == old_hostname) ? '' : '\n---\n';
        old_hostname = check.hostname
        return [spacer, status(check.status), check.name + ' (' + check.lastresponsetime + 'ms)', ' | color=', color(check.status), ' href=', report_url(check.id), report(check)].join('');
      } else {
        statuses.push(check.status);
        var spacer = (check.hostname == old_hostname) ? '' : '\n---\n';
        return;
      }
    } else {
      // Ignore this host
    }
  }).join('\n');
  console.log(statusIcon(statuses) + '\n---\n' + output);
}

https.get(options, function(res) {
  var body = ''
  res.on('data', function(data) {
    body += data;
  });
  res.on('end', function() {
    handleResponse(JSON.parse(body));
  });
});
