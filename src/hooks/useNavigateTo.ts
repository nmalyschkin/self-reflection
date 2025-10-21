import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useNavigateTo(path: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    navigate(path);
  }, [navigate, path]);
}
