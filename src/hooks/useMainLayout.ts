import { useSidebarContext } from "@/contexts/SidebarContext";

export function useMainLayout() {
  const { collapsed } = useSidebarContext();
  
  // Return the appropriate padding class based on sidebar state
  // Using margin-left for sidebar offset and consistent padding on all sides
  const mainPaddingClass = collapsed ? "lg:ml-20" : "lg:ml-64";
  const mainMarginClass = collapsed ? "lg:ml-20" : "lg:ml-64";
  
  return {
    collapsed,
    mainPaddingClass,
    mainMarginClass,
  };
}
