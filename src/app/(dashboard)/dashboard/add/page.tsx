import { FC } from "react";

import AddfriendButton from "@/components/AddfriendButton";

const page = ({}) => {
  return (
    <section className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <AddfriendButton />
    </section>
  );
};

export default page;
