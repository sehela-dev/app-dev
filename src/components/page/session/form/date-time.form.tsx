"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { defaultDate } from "@/lib/helper";
import { FormProvider, useFormContext } from "react-hook-form";

export const SessionDateTimeFormComponent = () => {
  const methods = useFormContext();
  const { control } = methods;

  return (
    <FormProvider {...methods}>
      <Card className="h-full">
        <CardHeader className="font-semibold">Date & Time</CardHeader>
        <CardContent>
          <div className="grid space-y-2">
            <FormField
              control={control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <DateRangePicker
                      mode="single"
                      allowPastDates={false}
                      allowFutureDates
                      onDateRangeChange={(e) => field.onChange(e)}
                      startDate={defaultDate().formattedToday}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid space-y-2 grid-cols-2 gap-2 pt-4">
            <FormField
              control={control}
              name="time_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    Start Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      id="start_time-picker"
                      // defaultValue="10:30"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]  appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="time_end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className=" text-brand-999 font-medium text-sm" required>
                    End Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      id="end_time-picker"
                      // defaultValue="10:30"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]  appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
