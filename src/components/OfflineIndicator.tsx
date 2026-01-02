// import { useState, useEffect } from "react";
// import { Wifi, WifiOff, RefreshCw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNetworkStatus, useOfflineSync } from "@/hooks/useOffline";
// import { cn } from "@/lib/utils";

// interface OfflineIndicatorProps {
//   className?: string;
// }

// export const OfflineIndicator = ({ className }: OfflineIndicatorProps) => {
//   const { online } = useNetworkStatus();
//   const { sync, isSyncing } = useOfflineSync();
//   const [showIndicator, setShowIndicator] = useState(false);

//   useEffect(() => {
//     if (!online) {
//       setShowIndicator(true);
//     } else {
//       // Hide after a delay when coming back online
//       const timer = setTimeout(() => setShowIndicator(false), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [online]);

//   if (!showIndicator) return null;

//   return (
//     <div
//       className={cn(
//         "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg transition-all",
//         online
//           ? "bg-green-50 border-green-200 text-green-800"
//           : "bg-orange-50 border-orange-200 text-orange-800",
//         className
//       )}
//     >
//       {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}

//       <span className="text-sm font-medium">
//         {online ? "Back Online" : "Offline Mode"}
//       </span>

//       {online && (
//         <Button
//           size="sm"
//           variant="ghost"
//           onClick={sync}
//           disabled={isSyncing}
//           className="h-6 px-2 ml-1"
//         >
//           <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
//         </Button>
//       )}
//     </div>
//   );
// };
