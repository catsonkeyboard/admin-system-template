import { RouteObject } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { UserManagement } from './pages/UserManagement';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { MenuManagement } from './pages/MenuManagement';
import { RoleManagement } from './pages/RoleManagement';
import { PermissionManagement } from './pages/PermissionManagement';
import { LineChartManagement } from './pages/dashboard/LineChart';
import { BarChartManagement } from './pages/dashboard/BarChart';
import { PieChartManagement } from './pages/dashboard/PieChart';
import { ScatterChartManagement } from './pages/dashboard/ScatterChart';
import { RadarChartManagement } from './pages/dashboard/RadarChart';
import { SunburstChartManagement } from './pages/dashboard/SunburstChart';
import { MixedChartManagement } from './pages/dashboard/MixedChart';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'system/user',
        element: <UserManagement />,
      },
      {
        path: 'system/department',
        element: <DepartmentManagement />,
      },
      {
        path: 'system/menu',
        element: <MenuManagement />,
      },
      {
        path: 'system/role',
        element: <RoleManagement />,
      },
      {
        path: 'system/permission',
        element: <PermissionManagement />,
      },
      {
        path: 'dashboard/line',
        element: <LineChartManagement />,
      },
      {
        path: 'dashboard/bar',
        element: <BarChartManagement />,
      },
      {
        path: 'dashboard/pie',
        element: <PieChartManagement />,
      },
      {
        path: 'dashboard/scatter',
        element: <ScatterChartManagement />,
      },
      {
        path: 'dashboard/radar',
        element: <RadarChartManagement />,
      },
      {
        path: 'dashboard/sunburst',
        element: <SunburstChartManagement />,
      },
      {
        path: 'dashboard/mixed',
        element: <MixedChartManagement />,
      },
    ],
  },
];
