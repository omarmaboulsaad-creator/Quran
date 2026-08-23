import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {analyzeRecitation} from "@/lib/recitation-ai";
import {db} from "@/lib/db";
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const form=await req.formData(); const audio=form.get("audio"); if(!(audio instanceof File))return NextResponse.json({error:"audio is required"},{status:400});
 const context={surah:Number(form.get("surah")||1),startAyah:Number(form.get("startAyah")||1),endAyah:Number(form.get("endAyah")||7)};
 try{
  const result=await analyzeRecitation(audio,context);
  const session=await db.memorizationSession.create({data:{userId:user.id,surah:context.surah,startAyah:context.startAyah,endAyah:context.endAyah,rounds:1,status:"COMPLETED",accuracy:result.accuracy,durationSec:result.durationSec||0}});
  if(result.issues?.length) await db.mistake.createMany({data:result.issues.map(i=>({userId:user.id,sessionId:session.id,surah:i.surah,ayah:i.ayah,type:i.type,expectedText:i.expectedText,heardText:i.heardText,confidence:i.confidence}))});
  return NextResponse.json(result);
 }catch(e:any){return NextResponse.json({error:e.message},{status:503})}
}