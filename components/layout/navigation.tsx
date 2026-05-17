"use client";

import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { UserButton } from "@clerk/nextjs";
import Link from "next/dist/client/link";

export default function MenuNavigation() {
  return (
    <NavigationMenu className="w-full max-w-auto justify-start [&>:first-child]:w-full">
      <NavigationMenuList className="w-full">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/meal-prep">Meal Prep</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/recipes">Recipes</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="ml-auto">
          <UserButton showName />
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  );
}
