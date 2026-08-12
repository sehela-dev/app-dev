import { buildNumber, CustomTable } from "@/components/general/custom-table";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { formatCurrency } from "@/lib/helper";

import { useState } from "react";

import { CustomPagination } from "@/components/general/pagination-component";
import { useDebounce } from "@/hooks";
import { useGetProductList } from "@/hooks/api/queries/admin/products";
import { ILocation, IProductVariantItem } from "@/types/product.interface";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";


export const ProductSectionTabComponent = () => {
  const { cartItems, addItem, removeItem, updateQuantity } = useAdminManualTransaction();

  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceClass = useDebounce(search, 300);

  const [selectedRange, setSelectedRange] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const { data, isLoading } = useGetProductList({
    page,
    limit,
    is_rentable: 'false',
    view: 'variants',
    search: debounceClass,
  });

  // const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
  //   setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  // };

  // alwasy match/check cart data and table data for quantity
  const headers = [
    {
      id: "product_name",
      text: "Product Name",
      value: "product_name",
    },
    {
      id: "sku",
      text: "SKU",
      value: "sku",
    },

    {
      id: "price_idr",
      text: "Regular Price",
      value: (row: IProductVariantItem) => formatCurrency(row?.price_idr),
    },
    {
      id: "stock_location",
      text: "Stock Location",
      value: (row: IProductVariantItem) => <div className="flex flex-row items-center gap-2">{row?.inventory?.map((inv) => <Badge variant={'secondary'} key={inv.location_id}>{inv?.location?.name} - {inv.stock_available}</Badge>)}</div>


    },
    {
      id: "stock_available",
      text: "Total Available Stock",
      value: (row: IProductVariantItem) => <p>{row?.stock_available}/{row.stock_total}</p>
    },
    {
      id: "status",
      text: "Status",
      value: (row: IProductVariantItem) => (
        <p className={row?.is_active ? "text-green-400 uppercase" : "text-red-500 uppercasex"}>{row?.is_active ? "Active" : "Inactive"}</p>
      ),
    },
  ];

  const numberOptions = {
    text: "No",
    show: false,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const actionOptions = {
    text: "Qty",
    show: true,
    render: (row: IProductVariantItem) => {

      const qty = cartItems?.find((item) => item.id === row.id)?.quantity;

      //count should taken from cartctx

      // update cart context state
      // cartdata is always empty from the start
      // id is variant id, type is plus or minus qty, location_id is inventory.location_id (where stock is), invetory_id is where the stock is
      const onModifyQty = (id: number | string, type: "+" | "-", location: ILocation, inventory_id: string) => {
        const compositeId = createProductCartItemId(String(row.id), location.id);
        const item = cartItems?.find((item) => item.id === compositeId);
        const currentQty = item?.quantity || 0;
        const newQty = type === "+" ? currentQty + 1 : currentQty - 1;

        if (newQty < 0 || newQty > row.stock_available) return;

        if (newQty === 0) {
          removeItem(compositeId);
        } else if (item) {
          updateQuantity(compositeId, newQty);
        } else {
          addItem({
            id: compositeId,
            name: row.variant_name,
            description: row?.product_name,
            price: row.price_idr,
            quantity: newQty,
            type: "buy_product",
            badge: row.is_rentable ? 'Rent' : 'Buy',
            location_name: location.name,
            location_id: location.id

          })
        };
      }

      return (
        <div className="flex flex-col justify-start gap-4">
          {row?.inventory?.map((item, i) => {
            // Create unique ID for each location
            const compositeId = createProductCartItemId(String(row.id), item.location_id);

            // Get qty for THIS location only
            const qtyForThisLocation = cartItems?.find(
              (cartItem) => cartItem.id === compositeId
            )?.quantity ?? 0;

            return (
              <div key={item.location_id} className="flex flex-col gap-2">
                <Badge variant={'default'} className="flex flex-row items-center">
                  <MapPin /> {item?.location?.name}
                </Badge>

                <div className="text-brand-999 font-medium text-sm text-center">
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <Button
                      variant={"outline"}
                      className="bg-transparent w-8 h-8"
                      disabled={item?.stock_available === 0}
                      onClick={() => onModifyQty(row.id, "-", item.location, item.id)}
                    >
                      -
                    </Button>
                    <div className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-md">
                      {qtyForThisLocation}
                    </div>
                    <Button
                      variant={"outline"}
                      className="bg-transparent w-8 h-8"
                      disabled={item?.stock_available === 0}
                      onClick={() => onModifyQty(row.id, "+", item.location, item.id)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}



        </div >
      );
    },
  };
  return (
    <Card className="border-brand-100 w-full" >
      <CardHeader className="flex flex-row justify-between w-ful items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl text-brand-999 font-medium">Products</h3>
          <p className="text-sm text-gray-500">Enter customer information to buy product(s)</p>
        </div>
        <div className="flex flex-row gap-2">
          {/* <div className="flex  min-w-[60%] w-full">
            <DateRangePicker
              mode="range"
              onDateRangeChange={handleDateRangeChangeDual}
              startDate={selectedRange.from}
              endDate={selectedRange.to}
              allowFutureDates
              allowPastDates={false}
            />
          </div> */}
          <div className="flex w-full">
            <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <CustomTable headers={headers} data={data?.data ?? []} numberOptions={numberOptions} actionOptions={actionOptions} isLoading={isLoading} />
      </CardContent>
      <CardFooter>
        <CustomPagination
          onPageChange={(e) => {
            setPage(e);
          }}
          currentPage={page}
          showTotal
          hasPrevPage={data?.pagination?.has_prev}
          hasNextPage={data?.pagination?.has_next}
          totalItems={data?.pagination?.total_items as number}
          totalPages={data?.pagination?.total_pages as number}
          limit={limit}
        />
      </CardFooter>
    </Card >
  );
};


export const createProductCartItemId = (variantId: string, locationId: string) => {
  return `${variantId}__${locationId}`;
};

export const parseProductCartItemId = (itemId: string) => {
  const [variantId, locationId] = itemId.split("__");
  return { variantId, locationId };
};