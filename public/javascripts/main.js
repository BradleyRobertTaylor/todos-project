import Database from './database.js';
import TodoData from './todo_data.js';

class App {
  constructor(database) {
    this.database = database;
    this.mainTemplate;
    this.currentEditedTodoId;
    this.currentActiveSelector = 'all-todos';
    this.compileTemplates();
    this.database.getAllTodos()
      .then((todos) => {
        this.contextObj = new TodoData(todos);
        this.afterTodosUpdated();
      });
  }

  bindEvents() {
    const form = document.querySelector('form');

    // Add new todo
    document.querySelector('label[for="new_item"]')
      .addEventListener('click', this.showModal);

    // Close modal
    document.querySelector('#modal_layer')
      .addEventListener('click', () => {
        this.hideModal();
        form.reset();
      });

    // Submit new todo
    form.querySelector('input[type="submit"]')
      .addEventListener('click', event => {
        event.preventDefault();

        let formData = new FormData(form);
        let data = {};

        for (const pair of formData) {
          if (['Day', 'Month', 'Year'].includes(pair[1])) {
            pair[1] = '';
          }

          data[pair[0]] = pair[1];
        }

        if (title.value.length < 3) {
          alert('You must enter a title at least 3 characters long.');
          return;
        }

        this.database.addTodo(data)
          .then(() => {
            return this.database.getAllTodos();
          })
          .then((allTodos) => {
            this.contextObj = new TodoData(allTodos);
            this.currentActiveSelector = 'all-todos';
            this.afterTodosUpdated();
          });
      });

    // Mark as complete before todo created from form
    form.querySelector('button[name="complete"]')
      .addEventListener('click', event => {
        event.preventDefault();
        
        alert('Cannot mark as complete as item has not been created yet!')
      });

    // Sidebar section
    document.querySelectorAll('#sidebar section').forEach(section => {
      section.addEventListener('click', async event => {
        const currentSidebarItem = event.target.closest('[data-id]');
        this.currentActiveSelector = currentSidebarItem.dataset.id;

        switch (this.currentActiveSelector) {
          case ('all-todos'):
            await this.setContextToDefault();
            break;
          case ('No Due Date-all-list'):
            this.setContextNoDueDateAllLists();
            break;
          case ('No Due Date-complete'):
            this.setContextNoDueDateOnlyComplete();
            break;
          case ('completed'):
            this.setContextAllCompleteLists();
            break;
          default:
            let [month, year] = currentSidebarItem.dataset.title.split('/');

            if (currentSidebarItem.closest('#completed_todos')) {
              this.setContextToCorrectDate(month, year, true);
            } else {
              this.setContextToCorrectDate(month, year, false);
            }

        }

        this.afterTodosUpdated();
      });
    });

    // Delete a todo
    document.querySelectorAll('.delete').forEach(deleteIcon => {
      deleteIcon.addEventListener('click', event => {
        let id = event.target.closest('tr').dataset.id; 
        let title = document.querySelector('#main-title').textContent;

        this.database.deleteTodo(id)
          .then(() => {
            this.setContextAfterDelete(id, title);

            this.afterTodosUpdated(); 
          });
      });
    });

    // Toggle todo item complete/not complete
    document.querySelectorAll('.list_item').forEach(listItem => {
      listItem.addEventListener('click', event => {
        let todoId = event.target.closest('tr').dataset.id;
        let completed = !event.target.querySelector('input[checked]');
        let isCompletedTodosSection = false;

        if (document.querySelector('.active').closest('#completed_items')) {
          isCompletedTodosSection = true;
        }

        this.database.updateTodo({ completed }, todoId)
          .then(updatedTodo => {
            this.setContextAfterUpdate(updatedTodo, isCompletedTodosSection);
            this.afterTodosUpdated();
          });
      });
    });

    // Bring up modal to edit todo
    document.querySelectorAll('.list_item label').forEach(listItem => {
      listItem.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        form.reset();

        let todoId = event.target.closest('tr').dataset.id;
        this.currentEditedTodoId = todoId;

        this.populateFormFields(todoId, form).then(() => this.showModal());

        form.querySelector('input[type="submit"]')
          .addEventListener('click', event => {
            event.stopPropagation();
            event.preventDefault();
            
            let formData = new FormData(form);
            let data = {};

            for (const pair of formData) {
              if (['Month', 'Year', 'Day'].includes(pair[1])) {
                pair[1] = '';
              }

              data[pair[0]] = pair[1];
            }

            if (title.value.length < 3) {
              alert('You must enter a title at least 3 characters long.');
              return;
            }

            this.database.updateTodo(data, todoId)
              .then((updatedTodo) => {
                this.setContextAfterUpdate(updatedTodo);
                this.hideModal();
                this.afterTodosUpdated();
              });
          }, true);

          form.querySelector('button[name="complete"]')
            .addEventListener('click', event => {
              event.preventDefault();
              event.stopPropagation();

              let todoId = this.currentEditedTodoId;
              let isCompletedTodosSection = false;

              if (document.querySelector('.active').closest('#completed_lists')) {
                isCompletedTodosSection = true;
              }

              this.database.updateTodo({ completed: true }, todoId)
                .then(updatedTodo => {
                  this.setContextAfterUpdate(updatedTodo, isCompletedTodosSection);
                  this.hideModal();
                  this.afterTodosUpdated();
                });

            }, true);
      });
    });
  }

  async populateFormFields(id, form) {
    let todo = await this.database.getTodo(id);

    form.elements.title.value = todo.title;
    form.elements.day.value = todo.day || 'Day';
    form.elements.month.value = todo.month || 'Month';
    form.elements.year.value = todo.year || 'Year';
    form.elements.description.value = todo.description;
  }

  setContextAfterUpdate(updatedTodo, onlyCompleted) {
    updatedTodo = TodoData.addDueProperty(updatedTodo);

    let newContextTodos = this.contextObj.todos
      .filter(todo => todo.id != updatedTodo.id)
    newContextTodos.push(updatedTodo);

    let newContextSelectedTodos = this.contextObj.selected
      .filter(todo => todo.id != updatedTodo.id)
    newContextSelectedTodos.push(updatedTodo);

    if (onlyCompleted) {
      newContextSelectedTodos = TodoData.filterOnlyComplete(newContextSelectedTodos);
    }

    this.contextObj.todos = newContextTodos;
    this.contextObj.selected = newContextSelectedTodos;
    this.contextObj.current_section.data = this.contextObj.selected.length;

    let newTodosByDate = TodoData.sortTodosByDate(this.contextObj.todos);
    let newCompletedTodosByDate = TodoData.sortTodosByDate(this.contextObj.todos, true);

    this.contextObj.todos_by_date = newTodosByDate;
    this.contextObj.done_todos_by_date = newCompletedTodosByDate;
    this.contextObj.done = TodoData.filterOnlyComplete(this.contextObj.todos);
  }

  setContextAfterDelete(id, title) {
    this.contextObj.todos = this.contextObj.todos.filter(todo => todo.id != id);
    this.contextObj.selected = this.contextObj.selected.filter(todo => todo.id != id);
    this.contextObj.current_section.data = this.contextObj.selected.length;


    let newTodosByDate = TodoData.sortTodosByDate(this.contextObj.todos);
    let newCompletedTodosByDate = TodoData.sortTodosByDate(this.contextObj.todos, true);

    this.contextObj.todos_by_date = newTodosByDate;
    this.contextObj.done_todos_by_date = newCompletedTodosByDate;
    this.contextObj.done = TodoData.filterOnlyComplete(this.contextObj.todos);
  }

  async setContextToDefault() {
    let allTodos = await this.database.getAllTodos();
    this.contextObj = new TodoData(allTodos);
  }

  setContextAllCompleteLists() {
    this.contextObj.current_section.title = 'Completed';

    let selectedSection = TodoData.filterOnlyComplete(this.contextObj.todos);

    this.contextObj.selected = selectedSection;
    this.contextObj.current_section.data = selectedSection.length;
  }

  setContextNoDueDateOnlyComplete() {
    this.contextObj.current_section.title = 'No Due Date';    

    let selectedSection = TodoData.filterForNoDueDate(this.contextObj.todos);
    selectedSection = TodoData.filterOnlyComplete(
      TodoData.completedTodosLast(selectedSection)
    );

    this.contextObj.selected = selectedSection;
    this.contextObj.current_section.data = selectedSection.length;
  }

  setContextNoDueDateAllLists() {
    this.contextObj.current_section.title = 'No Due Date';    

    let selectedSection = TodoData.filterForNoDueDate(this.contextObj.todos);
    selectedSection = TodoData.completedTodosLast(selectedSection);

    this.contextObj.selected = selectedSection;
    this.contextObj.current_section.data = selectedSection.length;
  }

  setContextToCorrectDate(month, year, complete) {
    this.contextObj.current_section.title = `${month}/${year}`;
    let selectedSection = TodoData.filterForDate([...this.contextObj.todos], month, year);

    if (complete) {
      selectedSection = TodoData.filterOnlyComplete(selectedSection);
    }

    selectedSection = TodoData.completedTodosLast(selectedSection);
    this.contextObj.selected = selectedSection;
    this.contextObj.current_section.data = selectedSection.length;
  }

  setActiveGroup(dataId) {
    let currentActive = document.querySelector(`[data-id="${dataId}"]`);
    if (!currentActive) {
      document.querySelector('#all-header')?.classList.add('active');
    }

    currentActive?.classList.add('active');
  }

  afterTodosUpdated() {
    TodoData.selectedTodosCompletedTodosLast(this.contextObj);
    this.renderMainTemplate(this.contextObj);
    this.setActiveGroup(this.currentActiveSelector);
    this.bindEvents();
  }

  hideModal() {
    document.querySelectorAll('.modal').forEach(layer => {
      layer.style.display = "none";
    });
  }

  showModal() {
    document.querySelectorAll('.modal').forEach(layer => {
      layer.style.display = "block";
    });
  }

  renderMainTemplate(todoData) {
    document.body.innerHTML = this.mainTemplate(todoData);
  }

  compileTemplates() {
    this.mainTemplate = Handlebars.compile(
      document.querySelector('#main_template').innerHTML
    );

    Handlebars.registerPartial(
      'all_todos_template',
      document.querySelector('#all_todos_template').innerHTML
    );

    Handlebars.registerPartial(
      'all_list_template',
      document.querySelector('#all_list_template').innerHTML
    );

    Handlebars.registerPartial(
      'completed_list_template',
      document.querySelector('#completed_list_template').innerHTML
    );

    Handlebars.registerPartial(
      'completed_todos_template',
      document.querySelector('#completed_todos_template').innerHTML
    );

    Handlebars.registerPartial(
      'title_template',
      document.querySelector('#title_template').innerHTML
    );

    Handlebars.registerPartial(
      'list_template',
      document.querySelector('#list_template').innerHTML
    );

    Handlebars.registerPartial(
      'item_partial',
      document.querySelector('#item_partial').innerHTML
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App(new Database());
});
