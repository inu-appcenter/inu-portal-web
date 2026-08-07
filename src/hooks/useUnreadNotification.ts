import { useQuery } from "@tanstack/react-query";
import { getUnreadStatus } from "@/apis/members";
import useUserStore from "@/stores/useUserStore";

export const UNREAD_NOTIFICATION_QUERY_KEY = ["unread-notification-status"] as const;

export function useUnreadNotification() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const { data } = useQuery({
    queryKey: UNREAD_NOTIFICATION_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await getUnreadStatus();
        return Boolean(response.data);
      } catch (error) {
        return false;
      }
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  return {
    hasUnreadNotification: Boolean(data),
  };
}
