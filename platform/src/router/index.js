import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/views/layout/TheLayout.vue';

/* Router Modules */
import authRouter from './modules/auth';
import errorsRouter from './modules/errors';
import permissionRouter from './modules/permission';
import logsRouter from './modules/logs';
import adminRouter from './modules/admin';

Vue.use(Router);

/** note: sub-menu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 */

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its
 *                                child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    will control the page roles (you can set multiple roles)
    title: 'title'               the name show in sub-menu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    [expected] noCache: true     if true, the page will no be cached(default is false)
    [expected] breadcrumb: false if false, the item will hidden in breadcrumb(default is true)
    [expected] affix: true       if true, the tag will affix in the tags-view
  }
 */

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/dashboard',
        alias: '/',
        component: () => import('@/views/components/Dashboard/index'),
        name: 'Dashboard',
        meta: {
          title: 'route.dashboard', icon: 'mdi-view-dashboard', noCache: true, affix: true,
        },
      },
    ],
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/multidoc',
        component: () => import('@/views/components/MultiDoc/index'),
        name: 'MultiDoc',
        meta: {
          title: 'route.multidoc', icon: 'mdi-file-document', noCache: true, affix: true,
        },
      },
    ],
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/multichat',
        component: () => import('@/views/components/MultiChat/index'),
        name: 'MultiChat',
        meta: {
          title: 'route.multichat', icon: 'mdi-forum', noCache: true, affix: true,
        },
      },
    ],
  },
  ...authRouter,
];

export default new Router({
  // mode: 'history', // gh-pages
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
});

export const asyncRoutes = [
  /** When your routing table is too long, you can split it into small modules */
  // permissionRouter,
  logsRouter,
  errorsRouter,
  adminRouter,
  { path: '*', redirect: '/error/404', hidden: true },
];
