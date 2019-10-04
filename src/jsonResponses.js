const tasks = {};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getTasks = (request, response) => {
  const responseJSON = {
    tasks,
  };

  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    id: 'notFound',
    message: 'The page you are looking for was not found',
  };

  if (request.method === 'HEAD') {
    return respondMeta(request, response, 404);
  }

  return respondJSON(request, response, 404, responseJSON);
};

const addTask = (request, response, body) => {
  const responseJSON = {
    message: 'Task is required',
  };

  if (!body.task) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (tasks[body.task]) {
    responseCode = 204;
  } else {
    tasks[body.task] = {};
  }

  tasks[body.task].task = body.task;
  tasks[body.task].date = body.date;
  tasks[body.task].time = body.time;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondMeta(request, response, responseCode);
};

const deleteTask = (request, response, body) => {
  const responseJSON = {
      tasks,
  };

  const deleteKey = body.task;
  delete tasks[deleteKey];

  responseJSON.message = 'Deleted Successfully';

  return respondJSON(request, response, 200, responseJSON)
};

module.exports = {
  getTasks,
  addTask,
  deleteTask,
  notFound,
};
