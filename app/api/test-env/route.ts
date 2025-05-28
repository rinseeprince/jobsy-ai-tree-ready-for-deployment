import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    keyStart: process.env.OPENAI_API_KEY?.substring(0, 7) || "undefined",
    allEnvKeys: Object.keys(process.env).filter((key) => key.includes("OPENAI")),
  })
}
