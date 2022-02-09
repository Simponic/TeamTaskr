import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiContext } from '../../utils/api_context';
import { Button } from '../common/button';
import { Input } from '../common/input';

export const ProjectView = () => {
  const api = useContext(ApiContext);

  const { id } = useParams();
  const [project, setProject] = useState({});
  const [addUserEmailError, setAddUserEmailError] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');

  const addUserToProject = async () => {
    setAddUserEmailError('');
    const res = await api.post(`/projects/${id}/users`, { email: addUserEmail });
    if (!res.success) {
      setAddUserEmail(res.message);
    }
  };

  useEffect(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      // TODO: Get tasks,users associated with project
      setProject(res.project);
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <div className="p-4">
      <h1>{project.title}</h1>
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
    </div>
  );
};
