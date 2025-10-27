import { formatCurrency } from "@/lib/helper";
import Image from "next/image";

interface IProps {
  image?: string;
  title?: string;
  price: number | string;
  onClick: (id: string) => void;
}

export const ShopCardItem = ({
  image = "/assets/shop/example-matt.png",
  title = "Premium Yoga Mat Panjang Banget Pokoknyaa dah pokoknya buset",
  price = 250000,
  onClick,
}: IProps) => {
  return (
    <div className="max-w-[185px] md:max-w-none w-full min-h-[237px] max-h-[237px] h-full bg-brand-25 rounded-md shadow-md" onClick={onClick}>
      <div className="realative w-full min-h-[153px] max-h-[153px] h-full bg-brand-25">
        <Image src={image} alt={title} className="w-full h-full rounded-t-md object-cover" width={173} height={153} />
      </div>
      <div className="flex flex-col gap-2.5 p-2.5 text-brand-500 font-semibold">
        <p className="text-sm leading-[130%] text-primary line-clamp-2 whitespace-normal">{title}</p>
        <p>{formatCurrency(price)}</p>
      </div>
    </div>
  );
};
