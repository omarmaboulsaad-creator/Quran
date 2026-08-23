import {PrismaClient} from "@prisma/client"; import bcrypt from "bcryptjs";
const db=new PrismaClient();
async function main(){const email="demo@hafez.local";const u=await db.user.upsert({where:{email},update:{},create:{email,passwordHash:await bcrypt.hash("ChangeMe123!",12),name:"Demo User",progress:{create:{}}}});console.log(`Demo user: ${u.email} / ChangeMe123!`)}
main().finally(()=>db.$disconnect());