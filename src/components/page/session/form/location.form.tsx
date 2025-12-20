"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDebounce } from "@/hooks";
import { useGetClassRoo } from "@/hooks/api/queries/admin/class-room";
import { useMemo, useState } from "react";

import { FormProvider, useFormContext } from "react-hook-form";
import Select from "react-select";

export const SessionLocationFormComponent = () => {
  const methods = useFormContext();
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { control, watch } = methods;
  const session_arrangement = watch("place");

  const { data, isLoading } = useGetClassRoo({ search: debounceSearch, page: 1, limit: 10 });

  const onSearch = (e: string) => {
    setSearch(e);
  };

  const option = useMemo(() => {
    const opt = data?.data?.map((item) => ({
      label: item.name,
      value: item.id,
      ...item,
    }));

    return opt;
  }, [data]);
  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="font-semibold">Location</CardHeader>
        <CardContent>
          <div className="grid space-y-2">
            <FormField
              control={control}
              name="place"
              defaultValue={"offline"}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Location Type
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue="offline"
                      value={field.value}
                      className="flex flex-row gap-3 items-center"
                      onValueChange={(e) => {
                        field.onChange(e);
                        methods.resetField("room");
                        methods.resetField("location_address");
                        methods.resetField("room");
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="offline" id="place" />
                        <Label htmlFor="r1" className="text-brand-999">
                          Offline
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="online" id="place" />
                        <Label htmlFor="r1" className="text-brand-999">
                          Online
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {session_arrangement === "offline" ? (
              <>
                <FormField
                  control={control}
                  name="room"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Class Room
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          defaultValue={""}
                          options={option as never}
                          isLoading={isLoading}
                          className="basic-multi-select "
                          classNames={{
                            control: () =>
                              "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                            placeholder: () => "placeholder-gray-400",
                            singleValue: () => "text-brand-999",
                            input: () => "text-brand-999 bg-none",
                          }}
                          onInputChange={onSearch}
                          onChange={(e) => {
                            field.onChange(e);
                            methods.setValue("location", e.address);
                            methods.setValue("location_maps_url", e.maps_url);
                          }}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Location Detail
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          {...field}
                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="location_maps_url"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=" text-brand-999 font-medium text-sm" required>
                        Location Maps Url
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          {...field}
                          // className="w-auto min-w-[388px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className=" text-brand-999 font-medium text-sm" required>
                      Gmeets/Zoom Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                        placeholder="Type here.."
                        {...field}
                        // className="w-auto min-w-[388px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
