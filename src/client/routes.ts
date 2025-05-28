import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    layout("layouts/authenticated.tsx", [
        layout("layouts/system.tsx", [
            route("dashboard", "routes/dashboard.tsx")
        ]),
    ]),
] satisfies RouteConfig;
