import { nanoid } from "nanoid";
import React from "react";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";

import { M } from "./mutators";
import { listTodos, TodoUpdate, WorkingWindow } from "./todo";

import Header from "./components/header";
import MainSection from "./components/main-section";
import "todomvc-app-css/index.css";

// This is the top-level component for our app.
const App = ({ rep }: { rep: Replicache<M> }) => {
  // Subscribe to all todos and sort them.
  const todos = useSubscribe(rep, listTodos, [], [rep]);
  todos.sort((a, b) => a.sort - b.sort);

  // Define event handlers and connect them to Replicache mutators. Each
  // of these mutators runs immediately (optimistically) locally, then runs
  // again on the server-side automatically.
  const handleNewItem = (text: string) =>
    rep.mutate.createTodo({
      id: nanoid(),
      text,
      completed: false,
    });

  const toggleWorkingOnIt = async (update: TodoUpdate) => {
    if(update.workingOnIt) { 
      console.log("Starting to work on it...")
      let started = await rep.mutate.isStarted(update.id)
      if(!started) {
        update.startedOn = (new Date()).getTime()
      }
      update.currentWorkingOn = (new Date()).getTime()
      
      console.log(update)
    }

    if(!update.workingOnIt) {
      console.log("Finished working on it")
      //update.finishedWorking = (new Date()).getTime()
      let started = await rep.mutate.getCurrentWindowStart(update.id)
      const currentWindows = await rep.mutate.getWorkingWindows(update.id)
      update.workingWindows = [...currentWindows, {
        init: started,
        end: (new Date()).getTime()
      }]

      console.log(update)
    }
    rep.mutate.updateTodo(update)
    return update.workingWindows;
  }

  const handleUpdateTodo = (update: TodoUpdate) =>
    rep.mutate.updateTodo(update);

  const handleDeleteTodos = (ids: string[]) => {
    for (const id of ids) {
      rep.mutate.deleteTodo(id);
    }
  };

  const handleCompleteTodos = (completed: boolean, ids: string[]) => {
    for (const id of ids) {
      rep.mutate.updateTodo({
        id,
        completed,
      });
    }
  };

  // Render app.

  return (
    <div>
      <Header onNewItem={handleNewItem} />
      <MainSection
        todos={todos}
        onUpdateTodo={handleUpdateTodo}
        onWorkingOnIt={toggleWorkingOnIt}
        onDeleteTodos={handleDeleteTodos}
        onCompleteTodos={handleCompleteTodos}
      />
    </div>
  );
};

export default App;
