import { 
  Building2, 
  Settings, 
  Megaphone, 
  UtensilsCrossed, 
  BarChart3,
  Home,
  Users,
  ShoppingCart,
  Clock,
  PieChart
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import logoGoodzap from "@/assets/logo_goodzap.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Informações da Empresa", url: "/empresa", icon: Building2 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Campanhas", url: "/campanhas", icon: Megaphone },
  { title: "Cardápio", url: "/cardapio", icon: UtensilsCrossed },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Métricas de Vendas", url: "/metricas", icon: PieChart },
];

const operationalItems = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Horários", url: "/horarios", icon: Clock },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className="border-r border-border/50 bg-sidebar"
      collapsible="icon"
    >
      <div className="p-4 flex items-center gap-3 border-b border-border/50">
        {!collapsed ? (
          <img src={logoGoodzap} alt="GoodZap Logo" className="h-8 object-contain" />
        ) : (
          <img src={logoGoodzap} alt="GoodZap Logo" className="h-6 w-6 object-contain" />
        )}
        <SidebarTrigger className="ml-auto text-muted-foreground hover:text-primary transition-colors" />
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
            {!collapsed && "Principal"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                        hover:bg-muted/50 group
                        ${isActive(item.url) ? "bg-primary/10 neon-border" : ""}
                      `}
                      activeClassName="bg-primary/10 neon-border"
                    >
                      <item.icon className={`h-5 w-5 transition-colors ${isActive(item.url) ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                      {!collapsed && (
                        <span className={`text-sm ${isActive(item.url) ? "text-primary font-medium" : "text-foreground"}`}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
            {!collapsed && "Operacional"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {operationalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                        hover:bg-muted/50 group
                        ${isActive(item.url) ? "bg-secondary/10 neon-border" : ""}
                      `}
                      activeClassName="bg-secondary/10 neon-border"
                    >
                      <item.icon className={`h-5 w-5 transition-colors ${isActive(item.url) ? "text-secondary" : "text-muted-foreground group-hover:text-secondary"}`} />
                      {!collapsed && (
                        <span className={`text-sm ${isActive(item.url) ? "text-secondary font-medium" : "text-foreground"}`}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
