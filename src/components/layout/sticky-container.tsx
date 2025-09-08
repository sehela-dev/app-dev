export const StickyContainerComponent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="bg-gray-50 min-h-[58px] sticky bottom-0 z-50 w-full shadow-subtle shrink-0 font-serif">{children}</div>;
};
