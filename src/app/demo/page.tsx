"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

const Page = () => {
    const [loading,setLoading]=useState(false);
    const handleBlocking = async()=>{
        setLoading(true);
         await fetch("api/ai/google",{
            method:"POST"
        });
        setLoading(false);
    }

    const handleClientError =()=>{
      throw new Error("Client Error");
    }

    const handleApiError =async()=>{
      await fetch("/api/demo/error",{method:"POST"})
    }
    const handleInngestError = async () =>{
      await fetch("/api/demo/inngest-error}", {method:"POST"})
    }
  return (
    <div className="p-8 space-x-4">
        <Button disabled={loading} onClick={handleBlocking}>
           {loading ? "Loading...":"Get recipe"}
        </Button>

        <Button disabled={loading} variant="destructive" onClick={handleClientError}>
           Client Error
        </Button>

        <Button disabled={loading} variant="destructive" onClick={handleApiError}>
           Api Error
        </Button>

        <Button disabled={loading} variant="destructive" onClick={handleInngestError}>
           Inngest Error
        </Button>

    </div>
  )
}

export default Page