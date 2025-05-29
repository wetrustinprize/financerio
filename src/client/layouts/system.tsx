import { Outlet, useNavigate } from "react-router";
import { MdLogout } from "react-icons/md";
import { Button } from "@heroui/button";
import Cookies from "js-cookie";

export default function SystemLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("jwt");
        navigate("/");
    };

    return (
        <section className="p-4 flex gap-2 h-screen w-screen">
            <div className="h-auto p-4 rounded-xl bg-neutral-200 w-3xs">
                <Button isIconOnly color="danger" onPress={handleLogout}>
                    <MdLogout />
                </Button>
            </div>
            <div className="w-auto h-auto flex-1">
                <Outlet />
            </div>
        </section>
    );
}