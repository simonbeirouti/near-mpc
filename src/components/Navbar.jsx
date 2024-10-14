import {forwardRef} from "react";
import {useNearStore} from "../store";
import {Link, useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {routes} from "../App";
import {Home, LogOut, LogIn,ChevronDownIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
	const {wallet, signedAccountId} = useNearStore();

	const signIn = () => {
		wallet.signIn();
	};

	const signOut = () => {
		wallet.signOut();
	};

	const location = useLocation();
	const currentPath = location.pathname.replace(/^\//, "");

	return (
		<nav className="flex flex-row justify-between items-center w-screen p-2 z-10">
			<Link to="/">
				<Button variant="outline">
					<Home className="h-4 w-4" />
				</Button>
			</Link>
			<div className="flex flex-grow justify-end items-center">
				<NavigationMenu>
					<NavigationMenuList className="mr-2">
						{routes
							.filter(
								(route) =>
									route.path !== "/" &&
									(!route.auth || signedAccountId)
							)
							.map((route) => (
								<NavigationMenuItem className="flex items-center" key={route.path}>
									{route.children ? (
										<>
											<NavigationMenuTrigger className="flex items-center">
												<span className="hidden md:inline">{route.label}</span>
												<span className="md:hidden">{route.icon}</span>
											</NavigationMenuTrigger>
											<NavigationMenuContent>
												<div className="grid gap-2 p-2 text-center w-[200px] md:w-[300px]">
													{route.children.map(
														(child, index) => (
															<ListItem
																className={`w-full ${index === 0 && route.children.length % 2 !== 0 ? 'col-span-2' : ''}`}
																key={child.path}
																title={child.label}
																to={`/${route.path}${child.path ? `/${child.path}` : ''}`}
															>
																{child.description}
															</ListItem>
														)
													)}
												</div>
											</NavigationMenuContent>
										</>
									) : (
										<Link to={route.path}>
											<NavigationMenuItem className={`block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${currentPath === route.path ? 'bg-accent text-accent-foreground' : ''}`}>
												<span className="hidden md:inline">{route.label}</span>
												{route.icon && (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="md:hidden">{route.icon}</span>
															</TooltipTrigger>
															<TooltipContent>
																<p>{route.label}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											</NavigationMenuItem>
										</Link>
									)}
								</NavigationMenuItem>
							))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
			<div className="flex justify-end items-center">
				{signedAccountId ? (
					<Button
						onClick={signOut}
						className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 ease-in-out transform hover:scale-50"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				) : (
					<Button
						onClick={signIn}
						className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 ease-in-out transform hover:scale-50"
					>
						<LogIn className="h-4 w-4" />
					</Button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;

const ListItem = forwardRef(({className, title, children, to, ...props}, ref) => {
	return (
		<NavigationMenuLink asChild>
			<Link
				ref={ref}
				to={to}
				className={cn(
					"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
					className
				)}
				{...props}
			>
				<div className="text-sm font-medium leading-none">
					{title}
				</div>
				<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
					{children}
				</p>
			</Link>
		</NavigationMenuLink>
	);
});
ListItem.displayName = "ListItem";
