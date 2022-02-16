import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { Link } from 'react-router-dom';
import { Paper } from '../common/paper';
import { Button } from '../common/button';
import { ProjectNew } from './project_new';

export const Projects = () => {
  const api = useContext(ApiContext);

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setError('');
    const res = await api.get('/projects');
    setProjects(res.projects);
  };

  const deleteProject = async (id) => {
    const res = await api.del(`/projects/${id}`);
    if (res.success) {
      fetchProjects();
    } else if (res.message) {
      setError(res.message);
    }
  };

  useEffect(fetchProjects, []);

  return (
    <div className="flex flex-row justify-center m-4">
      <div className="w-96">
        <ProjectNew onNewProject={fetchProjects} />
        <div className="w-96 text-red-500 flex">{error}</div>
        {projects.map((project) => (
          <Paper key={project.id}>
            <div>
              <h2>{project.title}</h2>
              <div className="flex justify-end">
                <Button>
                  <Link to={`/projects/${project.id}`}> View </Link>
                </Button>
                <div className="pl-2" />
                <Button onClick={() => deleteProject(project.id)}>Delete</Button>
              </div>
            </div>
          </Paper>
        ))}
      </div>
    </div>
  );
};
