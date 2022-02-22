import { useNavigate } from 'react-router-dom';
import { Button } from '../common/button';
import { Paper } from '../common/paper';

export const ProjectCard = ({ project, onDelete, ...others }, context) => {
  const navigate = useNavigate();

  const openProject = (event) => {
    event.preventDefault();
    navigate(`/projects/${project.id}`);
  };
  return (
    <Paper className="project-card" {...others}>
      <div onClick={openProject}>
        <h2>{project.title}</h2>
        <div className="buttonbox">
          <Button onClick={() => onDelete()}>Delete</Button>
        </div>
      </div>
    </Paper>
  );
};
