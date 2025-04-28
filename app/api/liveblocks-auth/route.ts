import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  await auth.protect();

  const user = await currentUser();

  const roomId = request.nextUrl.searchParams.get("roomId");

  const session = liveblocks.prepareSession(`session-${user?.id}`, {
    userInfo: {
      name: user?.fullName ?? user?.emailAddresses[0].emailAddress ?? "",
      picture: user?.imageUrl ?? "",
      color: getRandomColor(),
    },
  });

  session.allow(roomId!, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
