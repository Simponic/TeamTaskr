import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiContext } from '../../utils/api_context';

export const ProjectView = () => {
  const api = useContext(ApiContext);

  const [project, setProject] = useState({});
  const { id } = useParams();

  useEffect(async () => {
    const res = await api.get(`/projects/${id}`);
    // TODO: Get tasks associated with project
    setProject(res.project);
  }, []);

  return (
    <div className="p-4">
      <h1>Project {project.title} </h1>
    </div>
  );
};
