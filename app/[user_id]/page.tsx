"use client";
import { useEffect } from "react";

function MagikComponent() {
  return (
    <div className="fixed inset-0 w-full h-full bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&rel=0&modestbranding=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
    </div>
  );
}

export default function Page({ params }: { params: { user_id: string } }) {
  const { user_id } = params;

  useEffect(() => {
    // Skip fetching for "magik" route
    if (user_id === "magik") {
      return;
    }

    const fetchUser = async () => {
      const user = await fetch(`/api/get-user?userId=${user_id}`);
      const data = await user.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        window.location.href = "/";
      }
    };
    fetchUser();
  }, [user_id]);

  // Show custom component for "magik" route
  if (user_id === "magik") {
    return <MagikComponent />;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
}
