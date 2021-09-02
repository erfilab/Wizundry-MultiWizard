import Layout from '@/views/layout/TheLayout.vue';

const adminRouter = {
    path: '/admin',
    component: Layout,
    redirect: 'noredirect',
    name: 'Admin',
    meta: {
        title: 'route.admins',
        icon: 'mdi-account-lock',
    },
    children: [
        {
            path: 'create',
            component: () => import('@/views/components/Admin/CreateExperiment.vue'),
            name: 'createExp',
            meta: { title: 'route.admin.create', roles: ['admin'], noCache: true },
        },
        {
            path: 'all',
            component: () => import('@/views/components/Admin/AllExperiments.vue'),
            name: 'AllExps',
            meta: { title: 'route.admin.all', roles: ['admin'], noCache: true },
        },
    ],
};

export default adminRouter;