import { useSidebarContext } from "@/contexts/SidebarContext";

export function useMainLayout() {
  const { collapsed } = useSidebarContext();
  
  // Return the appropriate padding class based on sidebar state
  const mainPaddingClass = collapsed ? "lg:pl-20" : "lg:pl-64";
  const mainMarginClass = collapsed ? "lg:ml-20" : "lg:ml-64";
  
  return {
    collapsed,
    mainPaddingClass,
    mainMarginClass,
  };
}
