const tasks = {};

// default respondJSON function
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// default respondMETA function
const respondMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// orderTasks for GET with parameters
const orderTasks = (request, response, order) => {
  const responseJSON = {
    tasks,
  };

  // grabs order from getTasks
  const orderVal = order;

  const unsortedItems = [];

  // retrieves all tasks using key values
  const keys = Object.keys(tasks);

  // grabs all tasks and arrays them to be ordered
  for (let i = 0; i < keys.length; i++) {
    unsortedItems.push(tasks[keys[i]]);
  }

  // internal function to handle sorting logic
  const orderByDate = (arr, prop) => {
    // Part of this code snippet was adapted from a stackexchange answer by Thomas Reggi
    // Answer URL: https://codereview.stackexchange.com/questions/104170/order-array-of-objects-by-date-property
    const unsortableTasks = [];

    // if sorting by date, removes any non dated items from the list to be saved for later
    if (prop === 'date') {
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i].date) {
          console.dir('item sent to unsortable');
          unsortableTasks.push(arr[i]);
          arr.splice(i, 1);
        }
      }

      // sorting function
      const sortedItems = arr.slice().sort((a, b) => {
        // creates variables from date value
        let aDateString = a.date;
        let bDateString = b.date;

        if (a.time) {
          // combines date string data with time if it exists
          aDateString = `${aDateString}T${a.time}`;
        } else {
          // handles if there is missing time
          aDateString += 'T00:00:01';
        }
        if (b.time) {
          bDateString = `${bDateString}T${b.time}`;
        } else {
          bDateString += 'T00:00:01';
        }

        // do not re-order if a date is sooner than b date
        if (new Date(aDateString) < new Date(bDateString)) {
          return -1;
        }
        // re-order if a date is later than b date
        if (new Date(aDateString) > new Date(bDateString)) {
          return 1;
        }
        // 0 to catch all
        return 0;
      });
      // adds items with no dates to the front of the list if they exist
      if (unsortableTasks.length > 0) {
        const combinedItems = [...unsortableTasks, ...sortedItems];
        return combinedItems;
      }
      return sortedItems;
    }

    // sorts by timestamp instead of date
    const sortedItems = arr.slice().sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    return sortedItems;
  };

  let newTasks = [];

  // calls sorting function based on which property to sort by
  if (orderVal > 0) {
    newTasks = orderByDate(unsortedItems, 'date');
  } else {
    newTasks = orderByDate(unsortedItems, 'timestamp');
  }

  // re-adds all tasks to the JSON object using key values
  const updatedTasks = {};
  for (let i = 0; i < newTasks.length; i++) {
    updatedTasks[`${newTasks[i].task}`] = newTasks[i];
  }
  responseJSON.tasks = updatedTasks;

  responseJSON.message = 'Ordered Successfully';

  // Check for HEAD request
  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

// GET Method
const getTasks = (request, response, params) => {
  const responseJSON = {
    tasks,
  };

  // checks for params, if not returns default GET
  if (params.order) {
    // checks if params are correct, if not throws badRequest error
    if (params.order !== 'created' && params.order !== 'date') {
      responseJSON.message = 'Missing correct order query parameter, set to creation or date';
      responseJSON.id = 'badRequest';

      return respondJSON(request, response, 400, responseJSON);
    }

    // calls orderTasks based on url params
    if (params.order === 'created') {
      return orderTasks(request, response, 0);
    }
    return orderTasks(request, response, 1);
  }
  // Check for HEAD request
  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }

  return respondJSON(request, response, 200, responseJSON);
};

// notFound function for any pages not explicitly listed
const notFound = (request, response) => {
  const responseJSON = {
    id: 'notFound',
    message: 'The page you are looking for was not found',
  };

  // check for HEAD request
  if (request.method === 'HEAD') {
    return respondMeta(request, response, 404);
  }

  return respondJSON(request, response, 404, responseJSON);
};

// addTask for POST add data
const addTask = (request, response, body) => {
  const responseJSON = {
    message: 'Task is required',
  };

  // returns badRequest if there is no task
  if (!body.task) {
    responseJSON.id = 'badRequest';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (tasks[body.task]) {
    responseCode = 204;
  } else {
    tasks[body.task] = {};
  }

  // adds in the task, date, and time data from the form
  tasks[body.task].task = body.task;
  tasks[body.task].date = body.date;
  tasks[body.task].time = body.time;

  // creates a timestamp at time of creation for sorting
  const date = new Date();
  tasks[body.task].timestamp = date.getTime();

  // returns if new item is created
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // returns for a HEAD request if nothing else
  return respondMeta(request, response, responseCode);
};

// deleteTask for POST delete data
const deleteTask = (request, response, body) => {
  const responseJSON = {
    tasks,
  };

  // gets key based on selected task from bodyParams
  const deleteKey = body.task;
  delete tasks[deleteKey];

  responseJSON.message = 'Deleted Successfully';

  // Check for HEAD request
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
