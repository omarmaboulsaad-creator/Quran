import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {db} from "@/lib/db";
export async function POST(req:Request){
 const u=await getCurrentUser(); if(!u)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const body=await req.json();
 if(!body.url)return NextResponse.json({error:"url is required"},{status:400});
 const r=await db.recording.create({data:{userId:u.id,url:String(body.url),durationSec:Number(body.durationSec||0),sessionId:body.sessionId||undefined}});
 return NextResponse.json(r);
}