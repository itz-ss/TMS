import { useAppSelector } from "../../store/hooks";

export const useAutoLogin = () => {
  const loading = useAppSelector((state) => state.auth.loading);
  const user = useAppSelector((state) => state.auth.user);

  return { loading, user };
};
