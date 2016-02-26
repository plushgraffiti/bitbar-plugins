#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Jenkins</bitbar.title>
// <bitbar.version>v1.0</bitbar.version>
// <bitbar.author>Paul Griffiths</bitbar.author>
// <bitbar.author.github>plushgraffiti</bitbar.author.github>
// <bitbar.desc>Build status from Jenkins</bitbar.desc>
// <bitbar.dependencies>node.js</bitbar.dependencies>

var https = require('https');
var jenkins_host = 'https://user:pass@example.org'
var url = jenkins_host + '/api/json?depth=1&pretty=true'

function status(result) {
  if (result === 'blue') {
    return '☀ ';
  } else if (result === 'yellow') {
    return '☁ ';
  } else {
    return '☂ ';
  }
}

function color(result) {
  if (result === 'blue') {
    return 'green';
  } else if (result === 'yellow') {
    return 'orange';
  } else {
    return 'red';
  }
}

function report(project){
  if (project.healthReport.length > 0) {
    return "\n\t" + project.healthReport[0].description + " | length=50";
  } else {
    return "\nJob aborted: No build history available";
  }
}

function statusIcon(statuses) {
  if (statuses.indexOf("aborted") >= 0) {
    return "Jn | color=red font=Helvetica-Bold size=16"
  } else if (statuses.indexOf("yellow") >= 0) {
    return "Jn | color=orange font=Helvetica-Bold size=16"
  } else {
    return "Jn | color=green font=Helvetica-Bold size=16"
  }
}

function handleResponse(body) {
  var statuses = [];
  var output = body.jobs.map(function(project){
    statuses.push(project.color)
    return [status(project.color), project.name, ' | color=', color(project.color), ' href=', project.url, report(project)].join('');
  }).join('\n---\n');
  console.log(statusIcon(statuses) + '\n---\n' + output);
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
