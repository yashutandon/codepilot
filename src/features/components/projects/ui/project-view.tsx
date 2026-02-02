"use client"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Poppins } from "next/font/google"
import Image from "next/image"
import { FaGithub } from 'react-icons/fa'
import { ProjectList } from "./projects-list"
import { useEffect, useState } from "react"
import { ProjectsCommandDialog } from "./projects-command-dialog"
import { ImportGithubDialog } from "./import-github-dialog"
import { NewProjectDialog } from "./new-project-dialog"

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
})

export const ProjectView = () => {

    const [commandDialogOpen, setCommandDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [newProjectDialogOpen,setNewProjectDialogOpen]=useState(false);
        
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyK") {
            e.preventDefault();
            setCommandDialogOpen(true);
          }
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyI") {
            e.preventDefault();
            setImportDialogOpen(true);
          }
          if((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyJ"){
            e.preventDefault();
            setNewProjectDialogOpen(true);
          }
        };

      
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }, []);


    
    return (
        <>
            <ProjectsCommandDialog open={commandDialogOpen}
            onOpenChange={setCommandDialogOpen}/>
            <ImportGithubDialog open={importDialogOpen}
            onOpenChange={setImportDialogOpen}/>
            <NewProjectDialog  open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}/>
            <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
                <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
                    <div className="flex justify-between gap-4 w-full items-center">
                        <div className="flex items-center gap-2 w-full group/logo">
                            <Image src="/logo.svg" alt="CodePilot" width="52" height="52" />
                            <h1 className={cn("text-4xl md:text-5xl  font-semibold ",
                                font.className,
                            )}>
                                odePilot
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewProjectDialogOpen(true);
                                }}
                                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none">
                                <div className="flex items-center justify-between w-full">
                                    <Plus className="size-4 text-white" />
                                    <Kbd className="bg-accent border">
                                        ctrl+shift+J
                                    </Kbd>
                                </div>
                                <div>
                                    <span className="text-sm text-white">
                                        New
                                    </span>
                                </div>
                            </Button>
                            <Button className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
                            onClick={() => setImportDialogOpen(true)}>
                                <div className="flex items-center justify-between w-full">
                                    <FaGithub className="size-4 text-white" />
                                    <Kbd className="bg-accent border">
                                        ctrl+shift+I
                                    </Kbd>
                                </div>
                                <div>
                                    <span className="text-sm text-white">
                                        Import
                                    </span>
                                </div>
                            </Button>
                        </div>

                        <ProjectList onViewAll={() => setCommandDialogOpen(true)} />

                    </div>
                </div>
            </div>
        </>
    )
}