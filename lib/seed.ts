import prisma from "./prisma";

export async function seed() {
  const user = await prisma.userDetails.create({
    data: { email: "test@test.com", redirect_url: "https://google.com" },
  });
  console.log(user);
}

seed();
