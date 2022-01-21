import {createRouter, createWebHashHistory, Router} from "vue-router";
import Test from "../views/test.vue";
const router: Router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path: '/', component: Test}
    ]
});

export default router;
