export interface NavLink {
    label: string;
    href: string;
  }
  
  export const navLinks: NavLink[] = [
    {
      label: "Загублені тварини",
      href: "/lost-animals",
    },
    {
      label: "Притулки/організації",
      href: "/shelters",
    },
  ];
  