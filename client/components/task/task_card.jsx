import { Paper } from '../common/paper';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { useState, useContext, useEffect } from 'react';
import { ApiContext } from '../../utils/api_context';

export const TaskCard = ({ projectId, task, users, onUpdate }) => {
  const api = useContext(ApiContext);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('New Task');
  const [assignedUser, setAssignedUser] = useState(-1);
  const [assignedUserName, setAssignedUserName] = useState('-');
  const [status, setStatus] = useState('incomplete');
  const [estimate, setEstimate] = useState('');
  const [description, setDescription] = useState('');

  const setFieldsFromInitialTask = () => {
    if (task) {
      setTitle(task.title);
      setAssignedUser(task.user ? task.user.id : users[0].id);
      setAssignedUserName(task.user ? `${task.user.firstName} ${task.user.lastName}` : '-');
      setStatus(task.status);
      setEstimate(task.estimate);
      setDescription(task.description);
    } else {
      setEditing(true);
    }
  };

  useEffect(setFieldsFromInitialTask, []);

  const deleteTask = async (id) => {
    const res = await api.del(`/projects/tasks/${id}`);
    if (res.success) {
      onUpdate();
    } else if (res.message) {
      setError(res.message);
    }
  };

  const updateTask = async () => {
    if (editing) {
      setError('');
      let body = {
        userId: assignedUser,
        title: title,
        status: status,
        estimate: estimate,
        description: description,
      };
      let res;
      if (task) {
        res = await api.put(`/projects/tasks/${task.id}`, body);
      } else if (projectId) {
        body.projectId = projectId;
        res = await api.post(`/projects/${projectId}/tasks`, body);
      }
      if (res.success) {
        onUpdate();
      } else if (res.message) {
        setError(res.message);
        if (task) {
          setFieldsFromInitialTask(); // This is why we can't set the default fields from the task in the useState's
        }
      }
    }

    if (task) {
      setEditing(!editing);
    }
  };

  const toggleTask = async () => {
    let body = {
      userId: assignedUser,
      title: title,
      status: status === 'complete' ? 'incomplete' : 'complete',
      estimate: estimate,
      description: description,
    };
    let res;
    if (task) {
      res = await api.put(`/projects/tasks/${task.id}`, body);
    } else {
      return;
    }
    if (res.success) {
      onUpdate();
    } else if (res.message) {
      setError(res.message);
      if (task) {
        setFieldsFromInitialTask();
      }
    }
  };

  return (
    <Paper>
      <div className={editing ? 'task editing' : 'task'}>
        <div className="text-red-500">{error}</div>
        {editing ? (
          <div>
            <div>
              <label>Title: </label>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label>Estimated Time: </label>
              <Input type="text" value={estimate} onChange={(e) => setEstimate(e.target.value)} />
            </div>
            <div>
              <label>Assigned to: </label>
              <select
                onChange={(e) => {
                  setAssignedUser(e.target.value);
                  setAssignedUserName(e.target.options[e.target.selectedIndex].text);
                }}
                value={assignedUser}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Status: </label>
              <select onChange={(e) => setStatus(e.target.value)} value={status}>
                <option value="complete">complete</option>
                <option value="incomplete">incomplete</option>
              </select>
            </div>
            <div>
              <label>Description: </label>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        ) : (
          <div>
            <div>{title}</div>
            <div>Estimate: {estimate}</div>
            <div>Assigned to: {assignedUserName}</div>
            <div>Status: {status}</div>
            <div>Description: {description}</div>
          </div>
        )}
        <div className="buttonbox">
          {!projectId ? <Button onClick={() => deleteTask(task.id)}>Delete</Button> : null}
          <Button onClick={updateTask}>{editing ? 'Submit' : 'Edit'}</Button>
          {!projectId ? (
            <Button onClick={toggleTask}>{status === 'incomplete' ? 'Complete Task' : 'Uncomplete Task'}</Button>
          ) : null}
        </div>
      </div>
    </Paper>
  );
};
