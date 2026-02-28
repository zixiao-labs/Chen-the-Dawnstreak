"use client";
if (typeof document !== 'undefined') {
  // @ts-ignore CSS module import - resolved by bundler at runtime
  import('mdui/mdui.css');
}

export {
  BrowserRouter as ChenRouter,
  Route,
  Routes,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useMatch,
} from 'react-router';
