import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiContext } from '../../utils/api_context';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { TaskCard } from '../task/task_card';

export const ProjectView = () => {
  const api = useContext(ApiContext);

  const { id } = useParams();
  const [project, setProject] = useState({});
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [globalError, setGlobalError] = useState('');
  const [addUserEmailError, setAddUserEmailError] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');

  const addUserToProject = async () => {
    setAddUserEmailError('');
    const res = await api.post(`/projects/${id}/users`, { email: addUserEmail });
    if (!res.success) {
      setAddUserEmailError(res.message);
    }
  };

  const fetchProject = async () => {
    const res = await api.get(`/projects/${id}`);
    if (res.success) {
      setProject(res);
      setUsers(res.users);
      setTasks(res.tasks);
    } else if (res.message) {
      setGlobalError(res.message);
    }
  };
  useEffect(fetchProject, []);

  return (
    <div className="p-4">
      <div>{project.title}</div>
      <p className="text-red-500">{globalError}</p>
      <div>
        <Input
          type="text"
          name="email"
          placeholder="Email"
          value={addUserEmail}
          onChange={(e) => setAddUserEmail(e.target.value)}
        />
        <p className="text-red-500">{addUserEmailError}</p>
        <Button onClick={addUserToProject}>Add User</Button>
      </div>
      <div className="flex justify-center">
        <TaskCard projectId={id} task={null} users={users} onUpdate={fetchProject} />
      </div>
      <div className="grid grid-flow-col gap-3 h-100">
        <div className="col-span-1">
          <div>
            Todo
            <div className="bg-red-200">
              {tasks
                .filter((task) => task.status == 'incomplete')
                .map((task, i) => (
                  <TaskCard task={task} users={users} onUpdate={fetchProject} key={i} />
                ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div>
            Done
            <div className="bg-green-200">
              {tasks
                .filter((task) => task.status == 'complete')
                .map((task, i) => (
                  <TaskCard task={task} users={users} onUpdate={fetchProject} key={i} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
