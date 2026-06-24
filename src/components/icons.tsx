import { forwardRef } from "react";
import type { Icon, IconProps } from "@phosphor-icons/react/dist/lib/types";
import {
  SquaresFourIcon as SquaresFourBase,
  UsersIcon as UsersBase,
  ArrowsLeftRightIcon as ArrowsLeftRightBase,
  CalculatorIcon as CalculatorBase,
  ChartBarIcon as ChartBarBase,
  CaretDownIcon as CaretDownBase,
  CaretUpIcon as CaretUpBase,
  CaretRightIcon as CaretRightBase,
  WalletIcon as WalletBase,
  ListIcon as ListBase,
  XIcon as XBase,
  SignOutIcon as SignOutBase,
  PlusIcon as PlusBase,
  ArrowUpRightIcon as ArrowUpRightBase,
  ArrowDownLeftIcon as ArrowDownLeftBase,
  ArrowLeftIcon as ArrowLeftBase,
  ScalesIcon as ScalesBase,
  PencilSimpleIcon as PencilSimpleBase,
  TrashIcon as TrashBase,
  PhoneIcon as PhoneBase,
  CheckIcon as CheckBase,
  CheckCircleIcon as CheckCircleBase,
  InfoIcon as InfoBase,
  WarningIcon as WarningBase,
  XCircleIcon as XCircleBase,
  CircleNotchIcon as CircleNotchBase,
} from "@phosphor-icons/react/dist/ssr";

// Wrap a Phosphor icon so it defaults to the "duotone" weight. Callers can
// still override `weight` per-instance since incoming props win.
function duotone(Base: Icon, displayName: string): Icon {
  const Wrapped = forwardRef<SVGSVGElement, IconProps>(function DuotoneIcon(
    props,
    ref
  ) {
    return <Base ref={ref} weight="duotone" {...props} />;
  });
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const SquaresFour = duotone(SquaresFourBase, "SquaresFour");
export const Users = duotone(UsersBase, "Users");
export const ArrowsLeftRight = duotone(ArrowsLeftRightBase, "ArrowsLeftRight");
export const Calculator = duotone(CalculatorBase, "Calculator");
export const ChartBar = duotone(ChartBarBase, "ChartBar");
export const CaretDown = duotone(CaretDownBase, "CaretDown");
export const CaretUp = duotone(CaretUpBase, "CaretUp");
export const CaretRight = duotone(CaretRightBase, "CaretRight");
export const Wallet = duotone(WalletBase, "Wallet");
export const List = duotone(ListBase, "List");
export const X = duotone(XBase, "X");
export const SignOut = duotone(SignOutBase, "SignOut");
export const Plus = duotone(PlusBase, "Plus");
export const ArrowUpRight = duotone(ArrowUpRightBase, "ArrowUpRight");
export const ArrowDownLeft = duotone(ArrowDownLeftBase, "ArrowDownLeft");
export const ArrowLeft = duotone(ArrowLeftBase, "ArrowLeft");
export const Scales = duotone(ScalesBase, "Scales");
export const PencilSimple = duotone(PencilSimpleBase, "PencilSimple");
export const Trash = duotone(TrashBase, "Trash");
export const Phone = duotone(PhoneBase, "Phone");
export const Check = duotone(CheckBase, "Check");
export const CheckCircle = duotone(CheckCircleBase, "CheckCircle");
export const Info = duotone(InfoBase, "Info");
export const Warning = duotone(WarningBase, "Warning");
export const XCircle = duotone(XCircleBase, "XCircle");
export const CircleNotch = duotone(CircleNotchBase, "CircleNotch");
