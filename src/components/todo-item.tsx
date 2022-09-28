import React, { useState } from "react";
import classnames from "classnames";
import { Todo, TodoUpdate, WorkingWindow } from "../todo";
import TodoTextInput from "./todo-text-input";
import dayjs from 'dayjs'

export function TodoItem({
  todo,
  onUpdate,
  onWorkingOnIt,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (update: TodoUpdate) => void;
  onWorkingOnIt: (update: TodoUpdate) => WorkingWindow[];
  onDelete: () => void;
}) {
  const { id } = todo;
  const [editing, setEditing] = useState(false);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const toggleWorkingOnIt = () => {
    todo.workingWindows = onWorkingOnIt({id, workingOnIt: !todo.workingOnIt})
  }

  const handleSave = (text: string) => {
    if (text.length === 0) {
      onDelete();
    } else {
      onUpdate({ id, text });
    }
    setEditing(false);
  };

  const handleToggleComplete = () =>
    onUpdate({ id, completed: !todo.completed });

  //Adds all the working windows and determines how many seconds have we been working on a single task
  function workingTime(workingWindows: WorkingWindow[]) {
    if(workingWindows.length == 0) return "none";
    let totalWorkingTime = workingWindows?.reduce((sum, currWindow) => {
      let end = dayjs(currWindow.end)
      let start = dayjs(currWindow.init)
      let diff = end.diff(start, 'seconds') //seconds
      console.log("Difference between", start, "and", end, ":", diff)
      return sum + diff
    } , 0) || 0

    if(totalWorkingTime> 60) {
      return `${Math.round((totalWorkingTime / 60))} minutes`
    } else {
      return `${totalWorkingTime} seconds`
    }
  }

  let element;
  if (editing) {
    element = (
      <TodoTextInput
        initial={todo.text}
        onSubmit={handleSave}
        onBlur={handleSave}
      />
    );
  } else {
    element = (
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
        />
        <label onDoubleClick={handleDoubleClick}>{todo.text}</label>
        <button className={todo.workingOnIt ? "started" : "start"} onClick={() => toggleWorkingOnIt()} />
        <button className="destroy" onClick={() => onDelete()} />
        <span className="time-working" >
          {!todo.workingOnIt ? (<>Work so far: {workingTime(todo.workingWindows || [])} since {dayjs(todo.startedOn).format("DD/MM/YYYY")}</>) : <>Currently working on this...</> }
        </span>
      </div>
    );
  }

  return (
    <li
      className={classnames({
        completed: todo.completed,
        editing,
      })}
    >
      {element}
    </li>
  );
}
