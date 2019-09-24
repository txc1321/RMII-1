const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses');
const jsonHandler = require('./responses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
    if(parsedUrl.pathname === '/addUser'){
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

            jsonHandler.addUser(request, res, bodyParams);
        });
    }
};

const handleGet = (request, response, parsedUrl) => {
    if(parsedUrl.pathname === '/style.css'){
        htmlHandler.getCSS(request, response);
    }
    else if(parsedUrl.pathname === '/getUsers'){
        jsonHandler.getUsers(request, response);
    }
    else{
        htmlHandler.getIndex(request, response);
    }
};

const handleHead = (request, response, parsedUrl) => {

};

const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);

    if(request.method === 'POST'){
        handlePost(request, response, parsedUrl);
    }
    else if(request.method === 'GET'){
        handleGet(request, response, parsedUrl);
    }
    else{
        handleHead();
    }
};

http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);
