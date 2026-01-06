"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";


export default function Home() {
  const pro= useQuery(api.projects.get);
  const createProject=useMutation(api.projects.create);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-14">
      <Button onClick={()=>createProject({
        name:"New project"
      })}>
        Add new
      </Button>
      {pro?.map(({ name,ownerId }) => <div key={ownerId} className="text-white flex flex-col border-4 p-5">
       <p> {name}</p>
       <p>
       Is Completed:{`${ownerId}`}
       </p>
      </div>)}
    </main>
  );
}
