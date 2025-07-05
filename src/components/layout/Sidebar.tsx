import { Link } from 'react-router-dom';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "../../components/ui/sidebar";
import { CollapsibleTrigger, CollapsibleContent, Collapsible} from "@/components/ui/collapsible";
import {
  ChevronRight,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

const menu = [
  {
    title: "Dashboard",
    url: "/",
    icon: PieChart, // 可替换为实际 icon
  },
  {
    title: "Users",
    icon: Bot, // 可替换为实际 icon
    items: [
      { title: "User List", url: "/users" },
      { title: "User Roles", url: "/users/roles" },
    ],
  },
  {
    title: "Posters",
    icon: GalleryVerticalEnd, // 可替换为实际 icon
    items: [
      { title: "Poster List", url: "/posters" },
      { title: "Categories", url: "/posters/categories" },
    ],
  },
  {
    title: "DynamicForm",
    icon: AudioWaveform, // 可替换为实际 icon
    items: [
      { title: "DynamicForm", url: "/dynamicForm" },
    ],
  },
  {
    title: "LiveStream",
    icon: Frame,
    items: [
      { title: "LiveStream", url: "/LiveStream" },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800">
        LOGO
      </div>
      <SidebarMenu className="flex-1 p-4 space-y-2">
        {menu.map((item) =>
          item.items ? (
            <Collapsible key={item.title}>
                <SidebarMenuItem >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                    {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} className="block px-4 py-2 hover:bg-gray-700 rounded">
                              <span>{subItem.title}</span>
                            </Link>
                        </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url} className="flex items-center w-full px-4 py-2 rounded hover:bg-gray-800 transition">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </aside>
  );
} 