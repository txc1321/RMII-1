const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses');
const jsonHandler = require('./jsonResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  // handles all POST requests using body params

  const res = response;

  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    // only POST options are to add or remove a task
    if (parsedUrl.pathname === '/addTask') {
      jsonHandler.addTask(request, res, bodyParams);
    } else if (parsedUrl.pathname === '/deleteTask') {
      jsonHandler.deleteTask(request, res, bodyParams);
    }
  });
};

const handleGet = (request, response, parsedUrl, params) => {
  // GET goes to index, getData, style, or not found
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/getTasks') {
    jsonHandler.getTasks(request, response, params);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else {
    jsonHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    // passes in params for sorting through GET
    handleGet(request, response, parsedUrl, params);
  }
};

http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);
