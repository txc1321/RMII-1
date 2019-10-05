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

  return respondJSON(request, response, 200, responseJSON)
};

const orderTasks = (request, response, body) => {
  const responseJSON = {
    tasks,
  };

  const orderVal = body.order;

  //grabs all tasks and arrays them to be ordered
  const unsortedItems = [];
    for(let task in tasks){
      unsortedItems.push(task);
    }

  const orderByDate = (arr, prop) => {
    //Part of this code snippet was adapted from a stackexchange answer by Thomas Reggi
    //Answer URL: https://codereview.stackexchange.com/questions/104170/order-array-of-objects-by-date-property
    const unsortableTasks = [];

    if(prop === "date") {
      for (let task in arr) {
        if (!task.date) {
          unsortableTasks.push(task);
          arr.delete(task);
        }
      }

      const sortedItems = arr.slice().sort((a, b) => {
        //checks what to order tasks by
        const aDateString = a.date + "T";
        const bDateString = b.date + "T";
        //handles if there is missing time
        if(a.time){
          aDateString.concat(a.time);
        }
        else{
          aDateString.concat("00:00:01");
        }
        if(b.time){
          bDateString.concat(b.time);
        }
        else{
          bDateString.concat("00:00:01");
        }
        return new Date(aDateString) < new Date(bDateString) ? -1 : 1;
      });

      return unsortableItems.concat(sortedItems);

    }
    else if(prop === "timestamp"){
      const sortedItems = arr.slice().sort((a, b) => {
        return a.timestamp < b.timestamp ? -1 : 1;
      });

      return unsortableItems.concat(sortedItems);
    }

    return unsortableItems;
  };

  let newItems = [];

  if(orderVal > 0){
    newItems = orderByDate(unsortedItems, "date");
  }
  else{
    newItems = orderByDate(unsortedItems, "timestamp");
  }

  

  responseJSON.message = 'Ordered Successfully';

  return respondJSON(request, response, 200, responseJSON);
};

module.exports = {
  getTasks,
  addTask,
  deleteTask,
  orderTasks,
  notFound,
};
