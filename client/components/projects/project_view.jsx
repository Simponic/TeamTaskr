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
  const [UserEmailError, setUserEmailError] = useState('');
  const [UserEmail, setUserEmail] = useState('');

  const addUserToProject = async () => {
    setUserEmailError('');
    const res = await api.post(`/projects/${id}/users`, { email: UserEmail });
    if (!res.success) {
      setUserEmailError(res.message);
    } else await fetchProject();
  };

  const removeUserFromProject = async () => {
    setUserEmailError('');
    const userRequesting = await api.get(`/users/me`);
    const res = await api.put(`/projects/${id}/users`, {
      email: UserEmail,
      userRequestingEmail: userRequesting.user.email,
    });
    if (!res.success) {
      setUserEmailError(res.message);
    } else await fetchProject();
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
    <div className="p-4 project-view">
      <div>{project.title}</div>
      <p className="text-red-500">{globalError}</p>
      <div>
        <Input
          type="text"
          name="email"
          placeholder="Email"
          value={UserEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <p className="text-red-500">{UserEmailError}</p>
        <Button onClick={addUserToProject}>Add User</Button>
        <Button onClick={removeUserFromProject}>Remove User</Button>
      </div>
      <div className="flex justify-center">
        <TaskCard projectId={id} task={null} users={users} onUpdate={fetchProject} />
      </div>
      <div className="tasks gap-3 h-100">
        <div>
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
        <div>
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
