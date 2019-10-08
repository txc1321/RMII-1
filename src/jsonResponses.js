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

  const date = new Date();
  tasks[body.task].timestamp = date.getTime();

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

  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const orderTasks = (request, response, body) => {
  const responseJSON = {
    tasks,
  };

  const orderVal = body.order;

  const unsortedItems = [];

  // grabs all tasks and arrays them to be ordered
  for (const task in tasks) {
    unsortedItems.push(tasks[task]);
  }

  const orderByDate = (arr, prop) => {
    // Part of this code snippet was adapted from a stackexchange answer by Thomas Reggi
    // Answer URL: https://codereview.stackexchange.com/questions/104170/order-array-of-objects-by-date-property
    const unsortableTasks = [];

    if (prop === 'date') {
      for (const task in arr) {
        if (!task.date) {
          unsortableTasks.push(task);
          arr.splice(arr.indexOf(task), 1);
        }
      }

      const sortedItems = arr.slice().sort((a, b) => {
        // checks what to order tasks by
        let aDateString = a.date;
        let bDateString = b.date;
        // handles if there is missing time
        if (a.time) {
          aDateString = aDateString + "T" + a.time;
        } else {
          aDateString = aDateString + "T00:00:01";
        }
        if (b.time) {
          bDateString = bDateString + "T" + b.time;
        } else {
          bDateString = bDateString + "T00:00:01";
        }

        if (new Date(aDateString) < new Date(bDateString)) {
          return -1;
        }
        if (new Date(aDateString) > new Date(bDateString)) {
          return 1;
        }

        return 0;
      });

      return unsortableTasks.concat(sortedItems);
    }

    const sortedItems = arr.slice().sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    return sortedItems;
  };

  let newTasks = [];

  if (orderVal > 0) {
    newTasks = orderByDate(unsortedItems, 'date');
  } else {
    newTasks = orderByDate(unsortedItems, 'timestamp');
  }

  const updatedTasks = {};
  for (let i = 0; i < newTasks.length; i++) {
    updatedTasks[`${newTasks[i].task}`] = newTasks[i];
  }

  responseJSON.tasks = updatedTasks;

  responseJSON.message = 'Ordered Successfully';

  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

module.exports = {
  getTasks,
  addTask,
  deleteTask,
  orderTasks,
  notFound,
};
