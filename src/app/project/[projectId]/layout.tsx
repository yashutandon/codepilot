

import { ProjectIdLayout } from "@/features/components/projects/ui/project-id-layout";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function IdLayout ({children,params}:{
    children:React.ReactNode,
    params:Promise<{projectId:string}>
}){

    const {projectId}=await params;
    return (
        <ProjectIdLayout projectId={projectId as Id<"projects">} >
            {children}
        </ProjectIdLayout>
    )
}