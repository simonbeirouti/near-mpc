import {useContext} from "react";
import {NearContext} from "../context";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Home} from "lucide-react";
import {routes} from "../App"; // Import the routes

const Navbar = () => {
	const {wallet, signedAccountId} = useContext(NearContext);

	const signIn = () => {
		wallet.signIn();
	};

	const signOut = () => {
		wallet.signOut();
	};

	return (
		<nav className="flex flex-row justify-between items-center w-screen p-2 z-10">
			<Link to="/">
				<Button variant="outline" size="icon">
					<Home className="h-4 w-4" />
				</Button>
			</Link>
			<div className="flex items-center space-x-4">
				{routes.filter(route => route.path !== "/").map((route) => (
					<Link key={route.path} to={route.path} className="hover:underline">
						{route.label}
					</Link>
				))}
				{signedAccountId ? (
					<Button onClick={signOut}>
						Logout {signedAccountId.slice(0, 4)}...
						{signedAccountId.slice(-4)}
					</Button>
				) : (
					<Button onClick={signIn}>Login</Button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
