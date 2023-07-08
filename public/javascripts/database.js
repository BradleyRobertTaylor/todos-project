export default class Database {
  async getAllTodos() {
    try {
      let request = await fetch(`/api/todos`);
      let response = await request.json();
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async addTodo(todo, callback) {
    try {
      let request = await fetch(`/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      let response = await request.json();

      if (callback) callback();
    } catch (err) {
      console.log(err);
    }
  }

  async getTodo(todoId) {
    try {
      let request = await fetch(`/api/todos/${todoId}`);
      let response = await request.json();
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteTodo(todoId) {
    try {
      let response = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });
      await response.text();
      return response.ok;
    } catch (err) {
      console.log(err);
    }
  }

  async updateTodo(todo, todoId) {
    try {
      let request = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify(todo),
      });
      let response = await request.json();
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async resetDatabase() {
    await fetch(`/api/reset`);
  }
}