import FlippableCard from "@/components/credit-card";

export default async function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <FlippableCard />
      </div>
    </>
  );
}
