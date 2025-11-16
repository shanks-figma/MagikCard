"use client";

import { useEffect, useState } from "react";

export type UserDetails = {
  id: string;
  email: string;
  redirect_url: string;
  user_id: string;
  card_front_url: string;
  card_back_url: string;
};

export const useGetUser = (user_id: string) => {
  const [user, setUser] = useState<UserDetails | null>(null);

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

export const useGetUserDetails = (email: string) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await fetch(`/api/get-user-details?email=${email}`);
      const data = await userDetails.json();
      console.log(data);
      setUserDetails(data);
    };
    fetchUserDetails();
  }, [email]);

  return userDetails;
};
