"use client";

import { FormProvider, useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { useGetClassSessionsCategory } from "@/hooks/api/queries/admin/class-session";
import { useMemo, useState } from "react";

import Select from "react-select";

import { useDebounce } from "@/hooks";
import { useGetInstructor } from "@/hooks/api/queries/admin/instructor";
import { Select as Selects, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

export const OPTION_TYPE = [
  {
    value: "regular",
    label: "Regular",
  },
  {
    value: "private",
    label: "Private",
  },
  {
    value: "special",
    label: "Special",
  },
];

export const SessionBasicInfoFormComponent = () => {
  const methods = useFormContext();
  const { control } = methods;
  const [search, setSearch] = useState("");
  const [searchInstructor, setSearchInstructor] = useState("");

  const debouncedSearch = useDebounce(search, 300); // 500ms delay
  const debouncedSearchInstructor = useDebounce(searchInstructor, 300); // 500ms delay

  const { data, isLoading: isLoadingClass } = useGetClassSessionsCategory({ page: 1, limit: 10, search: debouncedSearch });
  const { data: instructorData, isLoading: isLoadingInstructor } = useGetInstructor({ page: 1, limit: 10, search: debouncedSearchInstructor });

  const onSearchChange = (e: string) => {
    setSearch(e);
  };
  const onSearchInstructorChange = (e: string) => {
    setSearchInstructor(e);
  };

  const optionsClass = useMemo(() => {
    const opt = data?.data?.map((item) => ({
      value: item.id as string,
      label: item.class_name as string,
    }));
    return opt ?? [];
  }, [data]);

  const optionInstructor = useMemo(() => {
    const opt = instructorData?.data?.map((item) => ({
      value: item.id as string,
      label: item.full_name as string,
    }));
    return opt ?? [];
  }, [instructorData]);

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="font-semibold">Basic Information</CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 space-y-2 gap-2">
            <FormField
              control={control}
              name="session_name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Session Name
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
              name="capacity"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Capacity
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
          </div>
          <div className="grid grid-cols-3 space-y-2 gap-2">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Class Type
                  </FormLabel>
                  <FormControl>
                    <Selects
                      onValueChange={(e) => {
                        field.onChange(e);
                      }}
                      {...field}
                    >
                      <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                        <SelectValue placeholder="Select Class Type" className="!text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {OPTION_TYPE.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Selects>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="class"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Class Category
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      defaultValue={""}
                      options={optionsClass as never}
                      isLoading={isLoadingClass}
                      placeholder="Category.."
                      classNames={{
                        control: () =>
                          "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                        placeholder: () => "placeholder-gray-400",
                        singleValue: () => "text-brand-999",
                        input: () => "text-brand-999 bg-none",
                      }}
                      onInputChange={onSearchChange}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="instructor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Instructor
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      defaultValue={""}
                      options={optionInstructor as never}
                      isLoading={isLoadingInstructor}
                      className="basic-multi-select "
                      classNames={{
                        control: () =>
                          "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                        placeholder: () => "placeholder-gray-400",
                        singleValue: () => "text-brand-999",
                        input: () => "text-brand-999 bg-none",
                      }}
                      onInputChange={onSearchInstructorChange}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className=" text-brand-999 font-medium text-sm" required>
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                    placeholder="Type here.."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </FormProvider>
  );
};
