import { Bolt } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { BellDot } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { BriefcaseBusiness } from "lucide-react";
import { CircleHelp } from "lucide-react";
import { TriangleAlert } from "lucide-react";
import { Users } from "lucide-react";
import { Lock } from "lucide-react";
import { Dessert } from "lucide-react";
import { ShieldPlus } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Images } from "lucide-react";
import { Figma } from "lucide-react";
import { Play } from "lucide-react";
import { MapPin } from "lucide-react";
import { Database } from "lucide-react";
import { PanelsTopLeft } from "lucide-react";
import { PanelTop } from "lucide-react";


export const Menus = [
  // {
  //   name: "Rent",
  //   subMenuHeading: ["Design", "Scale"],
  //   subMenu: [
  //     {
  //       name: "Design",
  //       desc: "Responsive design",
  //       icon: PanelsTopLeft,
  //     },
  //     {
  //       name: "Management",
  //       desc: "Site control",
  //       icon: Bolt,
  //     },
  //     {
  //       name: "Navigation",
  //       desc: "Link pages",
  //       icon: PanelTop,
  //     },
  //     {
  //       name: "CMS",
  //       desc: "Management content",
  //       icon: Database,
  //     },
  //   ],
  //   gridCols: 2,
  // },
  {
    name: "Buy",
    subMenuHeading: ["Get started", "Programs", "Recent"],
    subMenu: [
      {
        name: "Markplace",
        desc: "Browse templates",
        icon: ShoppingBag,
        url: "/marketplace"
      },
      {
        name: "Meetups",
        desc: "Upcoming events",
        icon: MapPin,
        url: "/meetups"
      },
      {
        name: "Updates",
        desc: "Changelog",
        icon: BellDot,
        url: "/updates"
      },
      {
        name: "Academy",
        desc: "Watch lessions",
        icon: Play,
        url: "/academy"
      },
      {
        name: "Blog",
        desc: "Posts",
        icon: BookOpenText,
        url: "/blog"
      },
      {
        name: "Figma",
        desc: "Plugin",
        icon: Figma,
        url: "/figma"
      },
      {
        name: "Experts",
        desc: "Jobs",
        icon: BriefcaseBusiness,
        url: "/experts"
      },
      {
        name: "Gallery",
        desc: "Images",
        icon: Images,
        url: "/gallery"
      },
    ],
    gridCols: 3,
  },
  {
    name: "Support",
    subMenu: [
      {
        name: "Help",
        desc: "Center",
        icon: CircleHelp,
        url: "/help"
      },
      {
        name: "Community",
        desc: "Project help",
        icon: MessageCircle,
        url: "/community"
      },
      {
        name: "Emergency",
        desc: "Urgent issues",
        icon: TriangleAlert,
        url: "/emergency"
      },
    ],
    gridCols: 1,
  },
  {
    name: "Resources",
    subMenuHeading: ["Overview", "Features"],
    subMenu: [
      {
        name: "Enterprise",
        desc: "Overview",
        icon: ShieldPlus,
        url: "/enterprise"
      },
      {
        name: "Collaboration",
        desc: "Design together",
        icon: Users,
        url: "/collaboration"
      },
      {
        name: "Customers",
        desc: "Stories",
        icon: Dessert,
        url: "/customers"
      },
      {
        name: "Security",
        desc: "Your site secured",
        icon: Lock,
        url: "/security"
      },
    ],
    gridCols: 2,
  },
  {
    name: "Find Agent",
    url: "/findagent"
  },
  {
    name: "Contact",
    url: "/contact"
  },
];