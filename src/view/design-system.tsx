"use client";

import React, { useState } from "react";

// Design System Showcase Page (Next.js + Tailwind v4)
// NOTE: Avoid dynamic class names for Tailwind v4. Use static strings so the
// compiler can see them and generate the utilities.

export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark min-h-screen" : "min-h-screen"}>
      <div className="bg-background text-foreground min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold">Design System Showcase</h1>
            <button onClick={() => setDark((d) => !d)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
              {dark ? "Dark" : "Light"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
          <TypographyScale />
          <CoreColorSwatches />
          <BrandSwatches />
          <SemanticExamples />
        </main>

        <footer className="mt-10 border-t px-6 py-8 text-center text-sm text-muted-foreground">
          Tailwind v4 · Custom @theme tokens · Inter font · Static utility classes
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="rounded-2xl border bg-card p-6 text-card-foreground">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function TypographyScale() {
  // Use STATIC utility strings. No template literals like `text-${s}`.
  const sizes = [
    { label: "xxs", cls: "text-xxs" },
    { label: "xs", cls: "text-xs" },
    { label: "sm", cls: "text-sm" },
    { label: "base", cls: "text-base" },
    { label: "lg", cls: "text-lg" },
    { label: "xl", cls: "text-xl" },
    { label: "2xl", cls: "text-2xl" },
    { label: "3xl", cls: "text-3xl" },
    { label: "4xl", cls: "text-4xl" },
    { label: "5xl", cls: "text-5xl" },
    { label: "6xl", cls: "text-6xl" },
    { label: "7xl", cls: "text-7xl" },
    { label: "8xl", cls: "text-8xl" },
    { label: "9xl", cls: "text-9xl" },
  ];
  return (
    <Section title="Typography">
      <div className="space-y-3">
        {sizes.map(({ label, cls }) => (
          <div key={label} className="flex items-baseline justify-between border-b pb-2">
            <p className={`${cls} font-sans`}>The quick brown fox jumps over the lazy dog</p>
            <code className="text-xs text-muted-foreground">{cls}</code>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CoreColorSwatches() {
  // All class names are static strings.
  const gray = [
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    "bg-gray-300",
    "bg-gray-400",
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-gray-800",
    "bg-gray-900",
    "bg-gray-950",
  ];
  const red = ["bg-red-200", "bg-red-500", "bg-red-800"];
  const yellow = ["bg-yellow-200", "bg-yellow-500", "bg-yellow-800"];
  const green = ["bg-green-200", "bg-green-500", "bg-green-800"];
  const blue = ["bg-blue-200", "bg-blue-500", "bg-blue-800"];
  const violet = ["bg-violet-200", "bg-violet-500", "bg-violet-800"];

  const Group = ({ title, list }: { title: string; list: string[] }) => (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {list.map((cls) => (
          <div key={cls} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded border ${cls}`} />
            <code className="text-xs text-muted-foreground">{cls.replace("bg-", "")}</code>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Section title="Core Colors">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Group title="Gray" list={gray} />
        <div className="space-y-6">
          <Group title="Red" list={red} />
          <Group title="Yellow" list={yellow} />
        </div>
        <div className="space-y-6">
          <Group title="Green" list={green} />
          <Group title="Blue" list={blue} />
          <Group title="Violet" list={violet} />
        </div>
      </div>
    </Section>
  );
}

function BrandSwatches() {
  // Static brand shades
  const brand = [
    "bg-brand-25",
    "bg-brand-50",
    "bg-brand-100",
    "bg-brand-200",
    "bg-brand-300",
    "bg-brand-400",
    "bg-brand-500",
    "bg-brand-600",
    "bg-brand-700",
    "bg-brand-800",
    "bg-brand-900",
    "bg-brand-950",
  ];
  return (
    <Section title="Brand Colors">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {brand.map((cls) => (
          <div key={cls} className="text-center">
            <div className={`h-10 w-full rounded border ${cls}`} />
            <code className="mt-1 block text-xs text-muted-foreground">{cls.replace("bg-", "")}</code>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SemanticExamples() {
  return (
    <Section title="Semantic Tokens">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Tile name="Background" classes="bg-background text-foreground" />
        <Tile name="Primary" classes="bg-primary text-primary-foreground" />
        <Tile name="Secondary" classes="bg-secondary text-secondary-foreground" />
        <Tile name="Muted" classes="bg-muted text-muted-foreground" />
        <Tile name="Accent" classes="bg-accent text-accent-foreground" />
        <Tile name="Destructive" classes="bg-destructive text-white" />
      </div>
    </Section>
  );
}

function Tile({ name, classes }: { name: string; classes: string }) {
  return (
    <div className={`rounded-lg border p-4 ${classes}`}>
      <p className="font-medium">{name}</p>
      <code className="text-xs opacity-80">{classes}</code>
    </div>
  );
}
