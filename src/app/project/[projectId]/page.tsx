
import { ProjectIdView } from '@/features/components/projects/ui/project-id-view';
import { Id } from '../../../../convex/_generated/dataModel';

const IndividualProjectPage = async({
  params,
}:{
  params:Promise<{projectId:Id<"projects">}>
}) => {

  const {projectId}=await params;
  return (
    <ProjectIdView projectId={projectId}/>
  )
}

export default IndividualProjectPage