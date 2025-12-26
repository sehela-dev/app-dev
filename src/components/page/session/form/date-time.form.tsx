"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select as Selects, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FormProvider, useFormContext } from "react-hook-form";

interface IProps {
  start_date?: string;
  isEdit?: boolean;
}

const RECURRING_TYPE = [
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
];
export const SessionDateTimeFormComponent = ({ start_date, isEdit = false }: IProps) => {
  const methods = useFormContext();
  const { control } = methods;
  const isRecurring = methods.watch("is_recurring");

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
                      {...field}
                      mode="single"
                      allowPastDates={false}
                      allowFutureDates
                      onDateRangeChange={(e) => {
                        field.onChange(e);
                        console.log(e, field);
                      }}
                      startDate={start_date ?? field.value}
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
          {!isEdit && (
            <div className="flex flex-col gap-2 pt-2">
              <FormField
                control={control}
                name="is_recurring"
                defaultValue={"no"}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className=" text-brand-999 font-medium text-sm" required>
                      Is Recurring?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        defaultValue="no"
                        value={field.value}
                        className="flex flex-row gap-3 items-center"
                        onValueChange={(e) => {
                          field.onChange(e);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="no" id="is_recurring" />
                          <Label htmlFor="r1" className="text-brand-999">
                            No
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="yes" id="is_recurring" />
                          <Label htmlFor="r1" className="text-brand-999">
                            Yes
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isRecurring === "yes" ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={control}
                      name="recurring_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className=" text-brand-999 font-medium text-sm" required>
                            Recurring Type
                          </FormLabel>
                          <FormControl>
                            <Selects
                              onValueChange={(e) => {
                                field.onChange(e);
                              }}
                            >
                              <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                                <SelectValue placeholder="Select Recurring Type" className="!text-gray-400" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {RECURRING_TYPE.map((item) => (
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
                      name="recurring_count"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className=" text-brand-999 font-medium text-sm" required>
                            Recurring Count
                          </FormLabel>
                          <FormControl>
                            <Input
                              // defaultValue="10:30"
                              placeholder="Recurring count... "
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]  appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-gray-500 italic pt-2">
                    <p>Daily: repeats every day for the specified number of days</p>
                    <p>Weekly: repeats once per week on the same weekday</p>
                    <p>Monthly: repeats once per month on the same date</p>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FormProvider>
  );
};
