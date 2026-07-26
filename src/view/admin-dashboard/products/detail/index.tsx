'use client'

import { useParams } from "next/navigation";

export const ProductDetailView = () => {

  const params = useParams();
  const { id } = params;

  return (
    <div className="flex flex-col gap-4">

    </div>
  )

}