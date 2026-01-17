import { ChevronRightIcon } from "lucide-react";
import {FileIcon,FolderIcon} from '@react-symbols/icons/utils'
import { useState } from "react";
import { getItemPadding } from "./constants";
import { cn } from "@/lib/utils";

export const RenameInput = ({
    type,
    defaultValue,
    isOpen,
    level,
    onSubmit,
    onCancel
}:{type:"file" | "folder",
    defaultValue:string;
    isOpen?:boolean;
    level:number,
    onSubmit:(name:string)=>void;
    onCancel:()=>void;
})=>{
    const [value,setValue]=useState(defaultValue);

    const handleSubmit = () => {
        const trimmedValue = value.trim();
        
        // VSCode jaise - empty name allow nahi karte
        if(!trimmedValue || trimmedValue === defaultValue){
            onCancel();
            return;
        }
        
        onSubmit(trimmedValue);
    }

    return (
        <div className="w-full flex items-center gap-1 h-5.5 bg-accent/50 border border-accent-foreground/20"
        style={{paddingLeft:getItemPadding(level,type==="file")}}
        >
            <div className="flex items-center gap-0.5">
                {type==="folder" && (
                    <ChevronRightIcon className={cn(
                        "size-4 shrink-0 text-muted-foreground",
                        isOpen && "rotate-90"
                    )}/>
                )}

                {type==="file" && (
                    <FileIcon fileName={value} autoAssign className="size-4"/>
                )}
                {type==="folder" && (
                    <FolderIcon folderName={value} className="size-4 shrink-0 text-muted-foreground"/>
                )}
            </div>
            <input 
                autoFocus
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none px-1"
                onBlur={handleSubmit}
                onKeyDown={(e)=>{
                    if(e.key==="Enter"){
                        e.preventDefault();
                        handleSubmit();
                    }
                    if(e.key==="Escape"){
                        e.preventDefault();
                        onCancel();
                    }
                }}
                onFocus={(e)=>{
                    // VSCode behavior - file extension ko exclude karke select karo
                    const value = e.currentTarget.value;
                    if(type==="folder"){
                        e.currentTarget.select();
                    }else{
                        const lastDotIndex = value.lastIndexOf(".");
                        if(lastDotIndex > 0){
                            e.currentTarget.setSelectionRange(0, lastDotIndex);
                        }else{
                            e.currentTarget.select();
                        }
                    }
                }}
            />
        </div>
    )
}