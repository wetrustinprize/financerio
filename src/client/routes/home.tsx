import type { Route } from "./+types/home";
import { Input } from "@heroui/input";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (<div className="h-screen w-screen flex items-center justify-center">Hello world</div>);
}
