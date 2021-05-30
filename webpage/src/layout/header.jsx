import React from "react";
import { Link } from "react-router-dom";

import { ReactComponent as Logo } from "../images/logo-with-name.svg";

const Header = () => {
    return (
        <header className="flex justify-start items-center px-4 h-16">
            <div>
                <Link to="/">
                    <Logo height="2.5rem" />
                </Link>
            </div>
        </header>
    );
};

export default Header;
