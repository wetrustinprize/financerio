import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let jwt = Cookies.get("jwt");

    navigate(jwt === undefined ? "/login" : "/dashboard")
  }, [])

  return null;
}

export default Home;