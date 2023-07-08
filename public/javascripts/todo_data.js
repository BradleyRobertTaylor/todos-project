export default class TodoData {
  constructor(todos) {
    this.todos = TodoData.addDueProperty(todos);
    this.selected = TodoData.completedTodosLast(this.todos);
    this.current_section = {
      title: 'All Todos',
      data: this.selected.length,
    };
    this.todos_by_date = TodoData.sortTodosByDate(this.todos);
    this.done_todos_by_date = TodoData.sortTodosByDate(this.todos, true);
    this.done = TodoData.filterOnlyComplete(this.todos);
  }

  static filterOnlyComplete(todos) {
    return todos.filter(({ completed }) => completed);
  }

  static sortTodosByDate(todos, completed=false) {
    let formattedTodos;

    if (completed) {
      formattedTodos = TodoData.#formatCompletedTodos(todos);
    } else {
      formattedTodos = TodoData.#formatTodos(todos);
    }

    let formattedTodosArray = [];
    for (let prop in formattedTodos) {
      formattedTodosArray.push([prop, formattedTodos[prop]]);
    }

    let sortedAndFormattedTodos = {};
    
    formattedTodosArray.sort(TodoData.#todoDateSorter)
      .forEach((pair => {
        sortedAndFormattedTodos[pair[0]] = pair[1];
      }));

    return sortedAndFormattedTodos;
  }

  static addDueProperty(todos) {
    if (Array.isArray(todos)) {
      todos.forEach((todo) => {
        todo.due = 'No Due Date';
        if (![todo.month, todo.year].includes('')) {
          todo.due = `${todo.month}/${todo.year.slice(2)}`;
        }
      });
    } else {
      todos.due = 'No Due Date';
      if (![todos.month, todos.year].includes('')) {
        todos.due = `${todos.month}/${todos.year.slice(2)}`;
      }
    }

    return todos;
  }

  static completedTodosLast(todos) {
    let sortedTodos = [];
    todos.forEach((todo) => {
      if (todo.completed) {
        sortedTodos.push(todo); 
      } else {
        sortedTodos.unshift(todo);
      }
    });

    return sortedTodos;
  }

  static selectedTodosCompletedTodosLast(todoDataObject) {
    todoDataObject.selected = TodoData.completedTodosLast(todoDataObject.selected);
  }

  static #formatCompletedTodos(todos) {
    let sortedTodos = {};
    todos
      .filter(({ completed }) => completed)
      .forEach((todo) => {
      if (sortedTodos[todo.due]) {
        sortedTodos[todo.due].push(todo);
      } else {
        sortedTodos[todo.due] = [todo];
      }
    });

    return sortedTodos;
  }

  static #formatTodos(todos) {
    let sortedTodos = {};
    todos.forEach((todo) => {
      if (sortedTodos[todo.due]) {
        sortedTodos[todo.due].push(todo);
      } else {
        sortedTodos[todo.due] = [todo];
      }
    });

    return sortedTodos;
  }

  static filterForNoDueDate(todos) {
    return todos.filter(({ month, year }) => {
      return month === '' || year === '';
    });
  }

  static filterForDate(todos, selectedMonth, selectedYear) {
    return todos.filter(({ month, year }) => {
      return month === selectedMonth && year.endsWith(selectedYear); 
    });
  }

  static #todoDateSorter(todo1, todo2) {
    let year1 = todo1[0] === 'No Due Date' ? '1900' : '20' + todo1[0].split('/')[1];
    let month1 = todo1[0] === 'No Due Date' ? '0' : String(Number(todo1[0].split('/')[0]) - 1);
    let year2 = todo2[0] === 'No Due Date' ? '1900' : '20' + todo2[0].split('/')[1];
    let month2 = todo2[0] === 'No Due Date' ? '0' : String(Number(todo2[0].split('/')[0]) - 1);

    let date1 = new Date(year1, month1);
    let date2 = new Date(year2, month2);

    if (date1 < date2) {
      return -1
    } 

    if (date1 > date2) {
      return 1;
    }

    return 0;
  }
}