"use client";
import { useEffect } from "react";
// import { useSession } from "next-auth/react";

export default function Page({ params }: { params: { user_id: string } }) {
  const { user_id } = params;
  // const session = useSession();
  // console.log(session);
  // if (!session) {
  //   console.log("Unauthorized");
  //   redirect("/");
  // }

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetch(`/api/get-user?userId=${user_id}`);
      const data = await user.json();
      console.log("data", data);
      if (data.redirect_url) {
        return (window.location.href = data.redirect_url);
      } else {
        return (window.location.href = "/");
      }
    };
    fetchUser();
  }, [user_id]);

  return (
    <div className="flex justify-center items-center h-screen">Loading...</div>
  );
}
