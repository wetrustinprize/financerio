import Cookies from "js-cookie";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthenticatedLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        let jwt = Cookies.get("jwt");

        if(!jwt)
            navigate("/login")
    }, [])

    return (<Outlet />);
}