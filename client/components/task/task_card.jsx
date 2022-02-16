import { Paper } from '../common/paper';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { useState, useContext, useEffect } from 'react';
import { ApiContext } from '../../utils/api_context';

export const TaskCard = ({ task, users, onUpdate }) => {
  const api = useContext(ApiContext);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('-');
  const [assignedUser, setAssignedUser] = useState(-1);
  const [assignedUserName, setAssignedUserName] = useState('-');
  const [status, setStatus] = useState('-');
  const [estimate, setEstimate] = useState('-');

  const setFieldsFromInitialTask = () => {
    setTitle(task.title);
    // Current bug: when the user is not assigned, user can assign themselves, but it doesn't update
    // until the user refreshes the page.
    setAssignedUser(task.user ? task.user.id : users[0].id);
    setAssignedUserName(task.user ? `${task.user.firstName} ${task.user.lastName}` : '-');
    setStatus(task.status);
    setEstimate(task.estimate);
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
      const res = await api.put(`/projects/tasks/${task.id}`, {
        userId: assignedUser,
        title: title,
        status: status,
        estimate: estimate,
      });
      if (res.success) {
        onUpdate();
      } else if (res.message) {
        setError(res.message);
        setFieldsFromInitialTask(); // This is why we can't set the default fields from the task in the useState's
      }
    }

    setEditing(!editing);
  };

  return (
    <Paper>
      <div>
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
          </div>
        ) : (
          <div>
            <div>{title}</div>
            <div>Estimate: {estimate}</div>
            <div>Assigned to: {assignedUserName}</div>
            <div>Status: {status}</div>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={() => deleteTask(task.id)}>Delete</Button>
          <div className="pl-2" />
          <Button onClick={updateTask}>{editing ? 'Submit' : 'Edit'}</Button>
        </div>
      </div>
    </Paper>
  );
};
