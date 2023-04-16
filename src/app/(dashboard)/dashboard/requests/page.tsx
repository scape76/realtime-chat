import { getServerSession } from "next-auth";
import { FC } from "react";
import { notFound } from "next/navigation";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";

import FriendRequests from "@/components/FriendRequests";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  // ids of people who sent current logged in user friend requests

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_request`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;

      return {
        senderId,
        senderEmail: senderParsed.email,
      };
    })
  );

  return (
    <section className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          sessionId={session.user.id}
          incomingFriendRequests={incomingFriendRequests}
        />
      </div>
    </section>
  );
};

export default page;
