
import { ProjectIdView } from '@/features/components/projects/ui/project-id-view';
import { Id } from '../../../../convex/_generated/dataModel';

const IndividualProjectPage = async({
  params,
}:{
  params:Promise<{projectId:string}>
}) => {

  const {projectId}=await params;
  return (
    <ProjectIdView projectId={projectId as Id<"projects">}/>
  )
}

export default IndividualProjectPage