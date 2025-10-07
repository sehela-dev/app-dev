import Image from "next/image";

export const ShopCardItem = () => {
  return (
    <div className="max-w-[174px] w-full min-h-[237px] max-h-[237px] h-full bg-brand-25 rounded-md shadow-md">
      <div className="realative w-full min-h-[153px] max-h-[153px] h-full bg-brand-25">
        <Image src="/assets/shop/example-matt.png" alt="example" className="w-full h-full rounded-t-md" width={173} height={153} />
      </div>
      <div className="flex flex-col gap-2.5 p-2.5 text-brand-500 font-semibold">
        <p className="text-sm leading-[130%] text-primary line-clamp-2 whitespace-normal">
          Premium Yoga Mat Panjang Banget Pokoknyaa dah pokoknya busetx
        </p>
        <p>Rp. 250.000</p>
      </div>
    </div>
  );
};
