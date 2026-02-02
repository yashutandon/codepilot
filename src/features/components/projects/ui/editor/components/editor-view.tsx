import Image from "next/image";
import { Id } from "../../../../../../../convex/_generated/dataModel"
import { useFile, useUpdateFile } from "../../../hooks/use-files";
import { useEditor } from "../hooks/use-editor";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation"
import { CodeEditor } from "./code-editor";
import { useEffect, useRef } from "react";
import { AlertTriangleIcon } from "lucide-react";

const DEBOUNCE_MS=1500;


export const EditorView = ({projectId}:{projectId:Id<"projects">})=>{
    const {activeTabId}=useEditor(projectId);
    const activeFile=useFile(activeTabId);
    const updateFile= useUpdateFile();
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const isActiveFileBinary=activeFile && activeFile.storageId;
    const isActiveFileText=activeFile && !activeFile.storageId;

    useEffect(() => {
      return () => {
        if(timeout.current){
            clearTimeout(timeout.current);
        }
      }
    }, [activeTabId])
    


    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center">
                <TopNavigation projectId={projectId}/>
            </div>
            {activeTabId && <FileBreadcrumbs projectId={projectId} />}
            <div className="flex-1 min-h-0 bg-background">
            {!activeFile && (
                <div className="size-full flex items-center justify-center">
                    <Image
                     src="/logo-alt.svg"
                      alt="CodePilot"
                      width={50}
                      height={50}
                      className="opacity-25"
                      />

                </div>
            )}
            {
                isActiveFileText && (
                    <CodeEditor
                    key={activeFile._id}
                    initialValue={activeFile.content ?? ""}
                    fileName={activeFile.name}
                    onChange={(content:string)=>{
                        if(timeout.current){
                            clearTimeout(timeout.current);
                        }
                        timeout.current = setTimeout (()=>{
                            updateFile({id:activeFile._id,content})
                        },DEBOUNCE_MS)
                    }}
                    />
                )
            }
            {isActiveFileBinary && (
               <div className="size-full flex items-center justify-center ">
                    <div className="flex flex-col items-center gap-2.5 max-w-md text-center">
                        <AlertTriangleIcon className="size-10 text-yellow-500"/>
                        <p className="text-sm">The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding.</p>
                    </div>
               </div>
            )}
            </div>
        </div>
    )
}