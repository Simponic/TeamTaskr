import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { Link } from 'react-router-dom';
import { Paper } from '../common/paper';
import { Button } from '../common/button';

export const Projects = () => {
  const api = useContext(ApiContext);

  const [projects, setProjects] = useState([]);

  useEffect(async () => {
    const res = await api.get('/projects');
    setProjects(res.projects);
  }, []);

  return (
    <div className="flex flex-row justify-center m-4">
      <div className="w-96">
        <Paper>
          {projects.map((project) => (
            <div key={project.id}>
              <h2>{project.title}</h2>
              <Button>
                <Link to={`/projects/${project.id}`}> View </Link>
              </Button>
            </div>
          ))}
        </Paper>
      </div>
    </div>
  );
};
