import { useState } from 'react';
import { Menu, PieChart, FileText, Settings, Home, GitCompare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate=useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItems = [
    { name: "Dashboard", icon: <Home className="h-4 w-4 mr-2" />, link: 'dashboard' },
    { name: "Reconciliation", icon: <GitCompare className="h-4 w-4 mr-2" />, link: 'reconciliation' },
    { name: "Reports", icon: <FileText className="h-4 w-4 mr-2" />, link: 'reports' },
    { name: "Analytics", icon: <PieChart className="h-4 w-4 mr-2" />, link: 'analytics' },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
                <GitCompare className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 font-bold text-xl cursor-pointer"><a href="/">ReconcileAI</a></span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {NavItems.map((item) => (
                  <NavigationMenuItem key={item.name} >
                    <NavLink className={({ isActive }) =>
                      `group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 ${isActive
                        ? "bg-gray-100 text-blue-600 focus:bg-gray-100 focus:text-blue-600 focus:outline-none"
                        : "bg-white hover:bg-gray-100 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600 focus:outline-none"
                      }`
                    } to={`/${item.link}`} >
                      <div className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer" >
                        {item.icon}
                        {item.name}
                      </div>
                    </NavLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User profile & settings */}
          <div className="hidden md:flex md:items-center">
            <Button variant="ghost" size="icon" className="mr-2 cursor-pointer" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar onClick={() => navigate('/profile')} className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="User"  />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
                        <GitCompare className="h-5 w-5 text-white" />
                      </div>
                      <span className="ml-2 font-bold text-xl">ReconcileAI</span>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Bank & Ledger Reconciliation
                  </SheetDescription>
                </SheetHeader>
                <Separator className="my-4" />
                <div className="flex flex-col space-y-4 mt-4">
                  {NavItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={
                        `inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ` +
                        (location.pathname === `/${item.link}` ? "bg-gray-100 text-blue-600" : "")
                      }
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        window.location.pathname = `/${item.link}`
                      }}
                      
                    >
                      {item.icon}
                      {item.name}
                    </Button>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8" onClick={() => navigate('/profile')}>
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-gray-500">john@example.com</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={()=>navigate('/settings')}>
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
