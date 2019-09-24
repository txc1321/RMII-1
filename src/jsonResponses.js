const users = {};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getUsers = (request, response, body) => {
  const responseJSON = {};

  if (body.method === 'HEAD') {
    if (body.url === '/getUsers') {
      return respondMeta(request, response, 200);
    }

    return respondMeta(request, response, 404);
  }

  if (body.url === '/getUsers') {
    console.dir("test");
    responseJSON.users = users;
    return respondJSON(request, response, 200, responseJSON);
  }

  responseJSON.id = 'notFound';
  responseJSON.message = 'The page you are looking for was not found';
  return respondJSON(request, response, 404, responseJSON);
};

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondMeta(request, response, responseCode);
};

module.exports = {
  getUsers,
  addUser,
};
