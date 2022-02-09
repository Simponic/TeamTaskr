import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { Link } from 'react-router-dom';
import { Paper } from '../common/paper';
import { Button } from '../common/button';
import { ProjectNew } from './project_new';

export const Projects = () => {
  const api = useContext(ApiContext);

  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.projects);
  };

  const deleteProject = async (id) => {
    const res = await api.del(`/projects/${id}`);
    if (res.success) {
      fetchProjects();
    }
  };

  useEffect(fetchProjects, []);

  return (
    <div className="flex flex-row justify-center m-4">
      <div className="w-96">
        <ProjectNew newProject={fetchProjects} />
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
