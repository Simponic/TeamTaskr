import { Paper } from '../common/paper';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { useState, useContext } from 'react';
import { ApiContext } from '../../utils/api_context';

export const ProjectNew = ({ newProject }) => {
  const api = useContext(ApiContext);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const submitProject = async () => {
    setError('');
    if (!title) {
      setError("Can't be blank");
    } else {
      await api.post('/projects', { title });
      newProject();
    }
  };

  return (
    <Paper>
      <h1>New Project</h1>
      <div>
        <Input
          type="text"
          name="title"
          placeholder="Project Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <p className="text-red-500">{error}</p>
        <Button onClick={submitProject}>Submit</Button>
      </div>
    </Paper>
  );
};
