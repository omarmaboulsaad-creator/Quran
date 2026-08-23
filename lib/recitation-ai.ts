export type RecitationIssue = {
  surah:number; ayah:number; type:"MEMORY"|"TAJWEED"|"TASHKEEL"|"PRONUNCIATION"|"OTHER";
  expectedText?:string; heardText?:string; confidence?:number; note?:string;
};

export async function analyzeRecitation(audio:Blob, context:unknown) {
  const url = process.env.RECITATION_AI_URL;
  const key = process.env.RECITATION_AI_KEY;
  if(!url || !key) throw new Error("RECITATION_AI_URL and RECITATION_AI_KEY must be configured");
  const form = new FormData();
  form.append("audio", audio, "recitation.webm");
  form.append("context", JSON.stringify(context));
  const r = await fetch(url,{method:"POST",headers:{Authorization:`Bearer ${key}`},body:form});
  if(!r.ok) throw new Error("Recitation AI provider failed");
  return await r.json() as {accuracy:number; issues:RecitationIssue[]; transcript?:string; durationSec?:number};
}