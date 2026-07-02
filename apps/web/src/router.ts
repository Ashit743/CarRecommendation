import { createRouter, createWebHistory } from "vue-router";

import HomeView from "./views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/questionnaire",
      name: "questionnaire",
      component: () => import("./views/QuestionnaireView.vue"),
    },
    {
      path: "/results",
      name: "results",
      component: () => import("./views/ResultsView.vue"),
    },
    {
      path: "/browse",
      name: "browse",
      component: () => import("./views/BrowseView.vue"),
    },
    {
      path: "/cars/:id",
      name: "car-detail",
      component: () => import("./views/CarDetailView.vue"),
      props: (route) => ({ id: Number(route.params["id"]) }),
    },
    {
      path: "/compare",
      name: "compare",
      component: () => import("./views/CompareView.vue"),
    },
  ],
});

export default router;
