import { PrismaClient } from "@prisma/client";
import ForumPost from "./ForumPost";
import { auth } from "@/app/auth";
import {notFound} from "next/navigation";

async function forumPostThread({ params }: { params: Promise<{ id: string }> }) {

  const prisma = new PrismaClient();

  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;

  const forumpost = await prisma.forumPost.findUnique({
    where: {
      id: id,
    },
    include: {
      author: {
        select: {
          name: true,
        }
      },
      votes: {
        where: {
          userId: userId
        }
      },
      tags: true,
      comments: {
        include: {
          author: true,
        }
      },
    },
  });
  if (!forumpost) {
    return notFound();
  }


  if (userId) {
    await prisma.viewHistory.upsert({
      where: { userId_forumPostId: { userId, forumPostId: forumpost.id } },
      update: {
        viewedAt: new Date(),
        count: {
          increment: 1,
        },
      },
      create: {
        userId,
        forumPostId: forumpost.id,
        viewedAt: new Date(),
      },
    })
  }


  return (
    <ForumPost post={forumpost} />
  )
}

export default forumPostThread;
