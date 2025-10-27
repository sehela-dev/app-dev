import { useRouter } from "next/navigation";
import { ShopCardItem } from "../general/shop-card";
import { Button } from "../ui/button";

interface IProps {
  title: string;
  onClickViewAll: () => void;
  category?: string;
}

export const ProductCategorySection = ({ title, onClickViewAll, category }: IProps) => {
  const router = useRouter();

  const onCLickItem = (id: string) => {
    router.push(`/shop/${id}`);
  };
  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center w-full justify-between text-brand-500 mt-2">
          <h3 className="text-xl font-bold leading-[130%]">{title}</h3>
          <Button variant={"ghost"} className="text-xs w-fit" onClick={onClickViewAll}>
            View All
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.25">
        {[1, 2].map((item) => (
          <ShopCardItem price={"1234555"} key={item} onClick={onCLickItem} />
        ))}
      </div>
    </>
  );
};
