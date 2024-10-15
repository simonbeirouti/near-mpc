import {useState} from "react";
import {useNearStore} from "../store";
import {Link, useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {routes} from "../App";
import {Home, LogOut, LogIn, Menu, ChevronDown, ChevronUp} from "lucide-react";
import {cn} from "@/lib/utils";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerClose,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const Navbar = ({className}) => {
	const {wallet, signedAccountId} = useNearStore();
	const [open, setIsOpen] = useState(false);
	const [expandedRoutes, setExpandedRoutes] = useState({});

	const signIn = () => {
		wallet.signIn();
	};

	const signOut = () => {
		wallet.signOut();
	};

	const location = useLocation();
	const currentPath = location.pathname.replace(/^\//, "");

	const toggleRouteExpansion = (routePath) => {
		setExpandedRoutes((prev) => ({...prev, [routePath]: !prev[routePath]}));
	};

	return (
		<>
			<nav
				className={cn(
					"flex flex-row justify-between items-center w-screen p-2 z-20 gap-2",
					className
				)}
			>
				<Link to="/">
					<Button variant="outline">
						<Home className="h-4 w-4" />
					</Button>
				</Link>
				<Drawer open={open} onOpenChange={setIsOpen}>
					<DrawerTrigger className="flex flex-grow justify-center items-center" asChild>
						<Button
							onClick={() => setIsOpen(true)}
						>
							<Menu className="h-4 w-4" />
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<div className="pt-4">
							<ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4  gap-4 mx-4">
								{routes
									.filter(
										(route) =>
											route.path !== "/" &&
											(!route.auth || signedAccountId)
									)
									.map((route) => (
										<li
											key={route.path}
											className="text-center rounded-md"
										>
											{route.children ? (
												<Select
													onValueChange={(value) => {
														setIsOpen(false);
														const selectedChild = route.children.find(child => `${route.path}/${child.path}` === value);
														if (selectedChild) {
															// Use your routing method here, e.g., navigate or history.push
															// For example: navigate(`/${route.path}/${selectedChild.path}`);
														}
													}}
												>
													<SelectTrigger className="w-full flex justify-center">
														<SelectValue className="font-bold" placeholder={route.label} />
													</SelectTrigger>
													<SelectContent>
														{route.children
															.filter(
																(child) =>
																	!child.index
															)
															.map((child) => (
																<SelectItem
																	key={`${route.path}-${child.path}`}
																	value={`${route.path}/${child.path}`}
																	className="flex justify-center"
																>
																	<Link
																		to={`/${
																			route.path
																		}${
																			child.path
																				? `/${child.path}`
																				: ""
																		}`}
																		className="text-sm hover:text-accent-foreground transition-colors block pl-4"
																	>
																		{
																			child.label
																		}
																	</Link>
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											) : (
												<Link
													to={route.path}
													className={cn(
														"",
														currentPath ===
															route.path
															? "text-accent-foreground"
															: ""
													)}
													onClick={() =>
														setIsOpen(false)
													}
												>
													<Button className="w-full" variant="outline">
														{route.label}
													</Button>
												</Link>
											)}
										</li>
									))}
							</ul>
						</div>
						<DrawerFooter className="flex justify-center items-center w-full">
							<DrawerClose className="w-full">
								<Button className="w-full" variant="outline">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
				<div className="flex justify-end items-center">
					{signedAccountId ? (
						<Button onClick={signOut} variant="destructive">
							<LogOut className="h-4 w-4" />
						</Button>
					) : (
						<Button onClick={signIn} className="bg-green-600 hover:bg-green-500">
							<LogIn className="h-4 w-4" />
						</Button>
					)}
				</div>
			</nav>
		</>
	);
};

export default Navbar;
