"use client";

import { Editor } from "@/components/liveblocks/editor";
import { Room } from "@/components/liveblocks/room";

export default function RoomPage() {
  return (
    <main>
      <Room>
        <Editor />
      </Room>
    </main>
  );
}
