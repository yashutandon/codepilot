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
  return (
    <div className="p-8 space-x-4">
        <Button disabled={loading} onClick={handleBlocking}>
           {loading ? "Loading...":"Get recipe"}
        </Button>
    </div>
  )
}

export default Page