import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import LeftNavMenuItem from "./LeftNavMenuItem";
import { categories } from "../utils/constants";
import { Context } from "../context/contextApi";

const LeftNav = () => {
  const { selectedCategory, setSelectedCategory, mobileMenu } =
    useContext(Context);

  const navigate = useNavigate();

  const clickHandler = (name, type) => {
    switch (type) {
      case "category":
        return setSelectedCategory(name);
      case "home":
        return setSelectedCategory(name);
      case "menu":
        return false;
      default:
        break;
    }
  };

  return (
    <div
      className={`md:block w-[240px] overflow-y-auto h-full py-4 bg-pink-50 absolute md:relative z-10 translate-x-[-240px] md:translate-x-0 transition-all ${
        mobileMenu ? "translate-x-0" : ""
      }`}
      style={{ overflowY: "auto" }} // Ẩn thanh cuộn khi mở menu trên màn hình di động
    >
      <div className="flex px-5 flex-col">
        {categories.map((item) => {
          return (
            <React.Fragment key={item.name}>
              <LeftNavMenuItem
                text={item.name}
                icon={item.icon}
                action={() => {
                  clickHandler(item.name, item.type);
                  if (item.type === "home") {
                    navigate(`/`);
                  } else {
                    navigate(`${item.link}`);
                  }
                }}
                className={`${
                  selectedCategory === item.name ? "bg-black/[0.15]" : ""
                }`}
              />
              {item.divider && <hr className="my-5 border-black/[0.2]" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LeftNav;
