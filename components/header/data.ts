export interface NavLink {
  labelKey: string; // Translation key instead of hardcoded text
  href: string;
}

export const navLinks: NavLink[] = [
  {
    labelKey: "Header.navigation.employees",
    href: "/employees",
  },
];
