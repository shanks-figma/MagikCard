"use client";

import { useEffect, useState } from "react";

export const useGetUser = (user_id: string) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetch(`/api/get-user?userId=${user_id}`);
      const data = await user.json();
      console.log(data);
      setUser(data);
    };
    fetchUser();
  }, [user_id]);

  return user;
};
