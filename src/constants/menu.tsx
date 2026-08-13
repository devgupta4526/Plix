import {
  AutomationDuoToneWhite,
  HomeDuoToneWhite,
  Links,
  RocketDuoToneWhite,
  SettingsDuoToneWhite,
} from "@/icons";
import { ShoppingBag } from "lucide-react";
import { v4 as uuid } from "uuid";

type Props = {
  label: string;
  id: string;
};

type SIDEBAR_MENU_TYPE = {
  icon: React.ReactNode;
} & Props;

export const SIDEBAR_MENU: SIDEBAR_MENU_TYPE[] = [
  {
    id: uuid(),
    label: "home",
    icon: <HomeDuoToneWhite />,
  },
  {
    id: uuid(),
    label: "automation",
    icon: <AutomationDuoToneWhite />,
  },
  {
    id: uuid(),
    label: "linkhub",
    icon: <Links />,
  },
  {
    id: uuid(),
    label: "products",
    icon: <ShoppingBag size={20} />,
  },
  {
    id: uuid(),
    label: "integrations",
    icon: <RocketDuoToneWhite />,
  },
  {
    id: uuid(),
    label: "settings",
    icon: <SettingsDuoToneWhite />,
  },
];
