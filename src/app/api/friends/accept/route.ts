import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // verify both users are not already friends

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) {
      return new Response("Already friend", { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_request`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    await Promise.all([
      await pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        user
      ),
      await pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),
      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_request`, idToAdd),
    ]);

    return new Response("OKAY");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 402 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
