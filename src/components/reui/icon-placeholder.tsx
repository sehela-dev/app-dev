import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RepeatIcon,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RepeatIcon,
} as const;

type IconPlaceholderProps = { lucide: keyof typeof ICONS } & LucideProps & Record<string, unknown>;

/** Minimal stand-in for ReUI's multi-icon-set placeholder: resolves the lucide name. */
export function IconPlaceholder(props: IconPlaceholderProps) {
  const { lucide, tabler, hugeicons, phosphor, remixicon, ...rest } = props;
  void lucide;
  void tabler;
  void hugeicons;
  void phosphor;
  void remixicon;
  const Icon = ICONS[props.lucide] ?? PlusIcon;
  return <Icon {...rest} />;
}
