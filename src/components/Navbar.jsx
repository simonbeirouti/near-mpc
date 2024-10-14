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
				{routes
					.filter(route => route.path !== "/" && (!route.auth || signedAccountId))
					.map((route) => (
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

// Named: akjsfhkajhsdasd.testnet
// Implicit Account ID: e4910e3af3f8affeeb1024ffbf19c85ffac4a289f456bcf4336718e332a36ef3
// Public Key: ed25519:GPEF6QWAvL4Rere1h7uX4i55pqs6SDY3zKLWF65i1Myc
// SECRET KEYPAIR: ed25519:BG44T6pge7Z9LUsCSDitcovCKesG87EfP3SxgeAJCKWnpCHPm7dMQJfR3HHHRSbyqX96W9zhrPPt1o7j5SKJwgW

// Master Seed Phrase: endorse pelican despair mutual diagram raccoon narrow bounce start tray biology exclude
// Seed Phrase HD Path: m/44'/397'/0'
// Implicit Account ID: f94f8a9a41d33cf155bfc3c4e840184ed2a319bdf29f5737410ea16a0f371924
// Public Key: ed25519:HnCs64iUNsA96VgRpr2b2bhDkMutnTNTPXyR18Xhns1M
// SECRET KEYPAIR: ed25519:4ppa5Kue6RhvZnyabWL4azUJT6FyNTwrTvw5Mb3j6m5xYwFi6zRqqk9932HdnzksZUubvK9813ZtHSmjjp3VuTRm