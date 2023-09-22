import { NavLink } from "react-router-dom";
import styles from "./PageNav.module.css";
import Logo from "./Logo";
import { useAuthContext } from "../contexts/FakeAuthContext";

function PageNav() {
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className={styles.nav}>
      <Logo />

      <ul>
        <li>
          <NavLink to="/pricing">pricing</NavLink>
        </li>
        <li>
          <NavLink to="/product">Product</NavLink>
        </li>
        {!isAuthenticated ? (
          <li>
            <NavLink to="/login" className={styles.ctaLink}>
              Login
            </NavLink>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

export default PageNav;
