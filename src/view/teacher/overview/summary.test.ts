import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classBreakdown,
  fillRate,
  hasNoActivity,
  hoursBetween,
  noShowRate,
  percentChange,
  sessionsInPeriod,
  sumHours,
  taughtSessions,
  trendPoints,
  upcomingWithin,
  type TeachingSession,
} from "./summary.ts";

const session = (over: Partial<TeachingSession> = {}): TeachingSession => ({
  session_id: "yoga-1",
  session_name: "Morning Flow",
  class_name: "Yoga",
  start_datetime: "2026-11-01T01:00:00Z",
  end_datetime: "2026-11-01T02:30:00Z",
  status: "scheduled",
  capacity: 10,
  booked_count: 0,
  attended_count: 0,
  no_show_count: 0,
  ...over,
});

test("hoursBetween and sumHours count only positive durations", () => {
  assert.equal(hoursBetween("2026-11-01T01:00:00Z", "2026-11-01T02:30:00Z"), 1.5);
  assert.equal(hoursBetween("2026-11-01T02:30:00Z", "2026-11-01T01:00:00Z"), 0);
  assert.equal(
    sumHours([
      session(),
      session({ session_id: "yoga-2", start_datetime: "2026-11-02T01:00:00Z", end_datetime: "2026-11-02T02:00:00Z" }),
    ]),
    2.5,
  );
});

test("fillRate is booked over capacity, null when capacity is zero", () => {
  assert.equal(fillRate(8, 10), 0.8);
  assert.equal(fillRate(3, 0), null);
});

test("noShowRate uses marked attendance only", () => {
  assert.equal(noShowRate(8, 2), 0.2);
  assert.equal(noShowRate(0, 0), null);
});

test("taught sessions: in period, started, not canceled; upcoming is next 7 days", () => {
  const now = "2026-11-15T00:00:00Z";
  const periodStart = "2026-10-24";
  const periodEnd = "2026-11-23";
  const rows = [
    session({ session_id: "taught", start_datetime: "2026-11-01T01:00:00Z" }),
    session({ session_id: "canceled", start_datetime: "2026-11-02T01:00:00Z", status: "canceled" }),
    session({ session_id: "future", start_datetime: "2026-11-20T01:00:00Z" }),
    session({ session_id: "outside", start_datetime: "2026-10-01T01:00:00Z" }),
  ];
  assert.deepEqual(
    taughtSessions(rows, now, periodStart, periodEnd).map((s) => s.session_id),
    ["taught"],
  );
  assert.deepEqual(
    sessionsInPeriod(rows, periodStart, periodEnd).map((s) => s.session_id),
    ["taught", "canceled", "future"],
  );
  assert.deepEqual(
    upcomingWithin(rows, now, 7).map((s) => s.session_id),
    ["future"],
  );
});

test("trend: oldest first, invoice status, current period provisional", () => {
  const points = trendPoints(
    ["2026-09", "2026-10", "2026-11"],
    [
      { report_year: 2026, report_month: 9, total_payment: 100, status: "paid" },
      { report_year: 2026, report_month: 10, total_payment: 200, status: "invoiced" },
    ],
    "2026-11",
    75.5,
    true,
  );
  assert.deepEqual(points, [
    { period: "2026-09", total: 100, status: "paid", provisional: false },
    { period: "2026-10", total: 200, status: "invoiced", provisional: false },
    { period: "2026-11", total: 75.5, status: "none", provisional: true },
  ]);
});

test("class breakdown groups sessions, joins fee by display id, sorts by earnings", () => {
  const rows = [
    session({ session_id: "yoga-1", class_name: "Yoga", booked_count: 8 }),
    session({ session_id: "yoga-2", class_name: "Yoga" }),
    session({ session_id: "pilates-1", class_name: "Pilates" }),
  ].map((row, i) => ({
    ...row,
    start_datetime: `2026-11-0${i + 1}T01:00:00Z`,
    end_datetime: `2026-11-0${i + 1}T02:00:00Z`,
  }));
  const breakdown = classBreakdown(rows, [
    { session_id: "yoga-1", class_name: "Yoga", fee: 100_000 },
    { session_id: "yoga-2", class_name: "Yoga", fee: 50_000 },
    { session_id: "pilates-1", class_name: "Pilates", fee: 20_000 },
  ]);
  assert.deepEqual(breakdown, [
    { class_name: "Yoga", sessions: 2, hours: 2, earnings: 150_000 },
    { class_name: "Pilates", sessions: 1, hours: 1, earnings: 20_000 },
  ]);
});

test("percentChange returns null when the previous total is zero", () => {
  assert.equal(percentChange(120, 100), 20);
  assert.equal(percentChange(80, 100), -20);
  assert.equal(percentChange(100, 0), null);
});

test("no activity means no past, no upcoming, no invoices", () => {
  assert.equal(hasNoActivity(0, 0, 0), true);
  assert.equal(hasNoActivity(1, 0, 0), false);
  assert.equal(hasNoActivity(0, 1, 0), false);
  assert.equal(hasNoActivity(0, 0, 1), false);
});
