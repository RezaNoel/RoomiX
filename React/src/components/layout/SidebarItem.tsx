import React from "react";

interface SidebarItemProps {
  name: string;
  icon: JSX.Element;
  selected: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ name, icon, selected }) => {
  return (
    <div
      className={`sidebar-item ${selected ? "selected" : ""}`}
      style={{
        fontWeight: selected ? "bold" : "normal",
      }}
    >
      {icon}
      <span>{name}</span>
    </div>
  );
};

export default SidebarItem;
