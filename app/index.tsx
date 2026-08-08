import { Redirect } from "expo-router";
import { useAuthStore } from "../store/auth";

export default function Index() {
  const { token, user } = useAuthStore();

  if (token && user) {
    if (user.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
    return <Redirect href="/(user)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
