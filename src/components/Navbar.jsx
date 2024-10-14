import {useContext} from "react";
import {NearContext} from "../context";
import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";
import {Home} from "lucide-react";

const Navbar = () => {
	const {wallet, signedAccountId} = useContext(NearContext);

	const signIn = () => {
		wallet.signIn();
	};

	const signOut = () => {
		wallet.signOut();
	};

	return (
		<nav className="flex flex-row justify-between w-screen p-2">
			<Link to="/">
				<Button variant="outline" size="icon">
					<Home className="h-4 w-4" />
				</Button>
			</Link>
			<div className="justify-end">
				{signedAccountId ? (
					<Button onClick={signOut}>
						Logout {signedAccountId.slice(0, 4)}...
						{signedAccountId.slice(-4)}
					</Button>
				) : (
					<Button onClick={signIn}>
						Login
					</Button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
