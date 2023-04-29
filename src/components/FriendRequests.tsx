"use client";

import { FC, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

import { CheckIcon, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FriendRequestsProps {
  sessionId: string;
  incomingFriendRequests: IncomingFriendRequest[];
}

const FriendRequests: FC<FriendRequestsProps> = ({
  sessionId,
  incomingFriendRequests,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_request`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };

    pusherClient.bind("incoming_friend_request", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_request`)
      );
      pusherClient.unbind("incoming_friend_request", friendRequestHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    try {
      await axios.post("/api/friends/accept", { id: senderId });

      setFriendRequests((prev) =>
        prev.filter((req) => req.senderId !== senderId)
      );

      router.refresh();
    } catch (error) {
      toast.error("Something failed during friend request acception");
    }
  };

  const denyFriend = async (senderId: string) => {
    try {
      await axios.post("/api/friends/deny", { id: senderId });

      setFriendRequests((prev) =>
        prev.filter((req) => req.senderId !== senderId)
      );

      router.refresh();
    } catch (error) {
      toast.error("Something failed during friend request deny");
    }
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zing-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-medium"
              onClick={() => acceptFriend(request.senderId)}
            >
              <CheckIcon className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-medium"
              onClick={() => denyFriend(request.senderId)}
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
