import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    let jwt = Cookies.get("jwt");

    navigate(jwt === undefined ? "/login" : "/dashboard")
  }, [])

  return null;
}
