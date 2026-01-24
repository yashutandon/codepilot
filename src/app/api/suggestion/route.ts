import {generateText,Output} from "ai";
import { NextResponse } from "next/server";
import {google} from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";


import {z} from "zod";
import { auth } from "@clerk/nextjs/server";

const suggestionSchema=z.object({
    suggestion:z.string().describe("the code to insert at cursor, or empty string if no completion needed")
})


const SUGGESTION_PROMPT = `You are an intelligent code completion assistant that provides contextual suggestions.

<context>
<file_name>{fileName}</file_name>
<current_line number="{lineNumber}">{currentLine}</current_line>
<cursor_position>
  <before>{textBeforeCursor}</before>
  <after>{textAfterCursor}</after>
</cursor_position>
<surrounding_code>
  <previous_lines>
{previousLines}
  </previous_lines>
  <next_lines>
{nextLines}
  </next_lines>
</surrounding_code>
<full_file>
{code}
</full_file>
</context>

<instructions>
Your task is to suggest code that should be typed at the cursor position. Follow this decision tree:

STEP 1: Check for redundancy
- If the code after the cursor or in next_lines already contains what would logically come next, return empty string
- If before_cursor ends with a complete statement (semicolon, closing brace, closing paren, or complete line in Python/YAML), return empty string

STEP 2: Determine completion type
Analyze before_cursor to identify what the user is typing:
- Function/method call - suggest parameters or closing parenthesis
- Object literal/array - suggest properties/elements or closing bracket
- Control structure (if/for/while) - suggest condition or block
- Variable declaration - suggest initialization or type
- Import/require statement - suggest module path or destructured items
- Incomplete expression - suggest the natural continuation

STEP 3: Generate suggestion
- Provide ONLY what should be inserted at cursor position (not already written code)
- Match the indentation and style of surrounding code
- Prioritize common patterns from the current file
- Keep suggestions concise (prefer single-line unless multi-line structure is clearly indicated)
- For ambiguous cases, suggest the most common/safe option

STEP 4: Validation
- Ensure suggestion doesn't duplicate existing code in after_cursor or next_lines
- Verify suggestion is syntactically valid in context
- If uncertain or context is insufficient, return empty string

Return ONLY the suggestion text, no explanations or metadata.
</instructions>`;


export async function POST(request:Request){
    try{
        const {userId}=await auth();
        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const {fileName,
            code,
            currentLine,
            previousLines,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            lineNumber}=await request.json();

        if(!code){
            return NextResponse.json({error:"code is required"},{status:400});
        }
        const prompt=SUGGESTION_PROMPT
        .replace("{fileName}",fileName)
        .replace("{code}",code)
        .replace("{currentLine}",currentLine)
        .replace("{previousLines}",previousLines || "")
        .replace("{textBeforeCursor}",textBeforeCursor)
        .replace("{textAfterCursor}",textAfterCursor)
        .replace("{nextLines}",nextLines || "")
        .replace("{lineNumber}",lineNumber.toString());

        const {output}=await generateText({
            model: openai("gpt-4.1-mini"),
            output:Output.object({schema:suggestionSchema}),
            prompt
        })

        return NextResponse.json({suggestion:output?.suggestion ?? ""})    }catch(e){
        console.error("Suggestion error:",e);
        return NextResponse.json({
            error:"Failed to generate suggestion"
        },{status:500}
    );    }
}