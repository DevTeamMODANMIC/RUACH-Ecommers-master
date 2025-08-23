import { useNavigate, useLocation, useParams } from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    params,
    asPath: location.pathname + location.search,
  }
}