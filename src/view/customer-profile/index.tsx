import { Divider } from "@/components/ui/divider";

export const ProfilePageView = () => {
  return (
    <div className="flex flex-col gap-6 mx-auto py-6 w-full font-serif text-brand-500">
      <div className="px-4">
        <h3 className="text-3xl font-extrabold ">Profile</h3>
      </div>
      <Divider color="var(--color-brand-200)" />
      <div className="px-4 flex flex-col w-full">
        <div className="flex flex-row items-end w-full justify-between">
          <p className="font-extrabold text-xl text-bra">My Class</p>
          <p className="font-semibold">View All</p>
        </div>
      </div>
    </div>
  );
};
