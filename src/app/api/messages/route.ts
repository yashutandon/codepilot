import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import {z} from "zod"
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";

const requestSchema=z.object ({
    conversationId:z.string(),
    message:z.string()
})

export async function POST(request:Request){
    const {userId}=await auth();

    if(!userId){
        return NextResponse.json({error:"Unauthorized"},{status:401})
    }

    const internalKey=process.env.CONVEX_INTERNAL_KEY;

    if(!internalKey){
        return NextResponse.json(
            {error:"Internal key not configured"},
            {status:500}
        )
    }

    const body=await request.json();
    const {conversationId,message}=requestSchema.parse(body)

    const conversation=await convex.query(api.system.getConversationById,{
        internalKey,
        conversationId:conversationId as Id<"conversations">
    });
    if(!conversation){
        return NextResponse.json(
            {error:"Conversation not found"},
            {status:404}
        );
    }
    const projectId=conversation.projectId;

    const ProcessingMessages=await convex.query(
        api.system.getProcessingMessages,
        {
            internalKey,
            projectId
        }
    )

    if(ProcessingMessages.length>0){
        await Promise.all(
            ProcessingMessages.map(async(msg)=>{
               try {
                 await inngest.send({
                  name:"message/cancel",
                  data:{
                      messageId:msg._id
                  }
                 });
               } catch (err) {
                 console.warn("Could not send cancel event to Inngest:", err);
               }
               await convex.mutation(api.system.updateMessageStatus,{
                internalKey,
                messageId:msg._id,
                status:"cancelled"
               })
            })
    
        )
    }

    await convex.mutation(api.system.createMessage,{
        internalKey,
        conversationId:conversationId as Id<"conversations">,
        projectId,
        role:"user",
        content:message
    })

    const assistantMessageId=await convex.mutation(api.system.createMessage,{
        internalKey,
        conversationId:conversationId as Id<"conversations">,
        projectId,
        role:"assistant",
        content:"",
        status:"processing"
    })

    let eventId = "local";
    try {
      const event = await inngest.send({
        name: "message/sent",
        data: {
          messageId: assistantMessageId,
          conversationId,
          projectId,
          message,
        },
      });
      eventId = event.ids[0] || "local";
    } catch (err) {
      console.error("Failed to send Inngest event:", err);
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId: assistantMessageId,
        content:
          "⚠️ **Inngest Dev Server is not running.**\n\nBackground AI execution requires the Inngest local runner in development.\nPlease start it in your terminal by running:\n```bash\nnpm run inngest:dev\n```\n(Or configure `INNGEST_EVENT_KEY` in `.env.local` if using Inngest Cloud).",
      });
    }

    return NextResponse.json({
        success:true,
        eventId,
        messageId:assistantMessageId
    })
}