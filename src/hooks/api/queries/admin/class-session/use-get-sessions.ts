import { getSessions } from "@/api-req/class-session";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetSessions = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "orders", "new-order", "sessions", params],
    queryFn: () => getSessions(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });

/* 
  {
    "id": "c40839a9-b894-4d93-87b5-a84969db6e69",
    "session_id": "ballet-7",
    "session_name": "Expert Ballet",
    "class_id": "a92512d6-d795-434d-bab5-cbbda009e88f",
    "capacity": 10,
    "instructor_id": "24116377-9f29-4bca-b2f4-b7ebb8e3ff9a",
    "instructor_name": "Jane Yoga",
    "session_description": "Ballet for Enthusiast",
    "start_datetime": "2025-12-20T01:00:00+00:00",
    "end_datetime": "2025-12-20T02:00:00+00:00",
    "type": "regular",
    "level": "advanced",
    "place": "offline",
    "room_id": null,
    "location": "Studio A, Jakarta",
    "location_maps_url": null,
    "meeting_link": null,
    "price_idr": 150000,
    "price_credit_amount": 1,
    "status": "scheduled",
    "created_at": "2025-12-12T10:49:35.400565+00:00",
    "updated_at": "2025-12-12T10:49:35.400565+00:00",
    "class": {
        "id": "a92512d6-d795-434d-bab5-cbbda009e88f",
        "class_name": "Ballet",
        "allow_credit": true
    },
    "start_date": "2025-12-20",
    "time_start": "08:00",
    "time_end": "09:00",
    "slots_booked": 2,
    "slots_total": 10,
    "slots_available": 8,
    "slots_display": "2/10",
    "is_full": false
} */
