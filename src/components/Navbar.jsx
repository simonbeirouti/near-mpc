import {useNearStore} from "../store";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Home} from "lucide-react";
import {routes} from "../App"; // Import the routes

const Navbar = () => {
	const {wallet, signedAccountId} = useNearStore();

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
					<Button
						onClick={signOut}
						className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
						style={{
							boxShadow: '0 0 10px #4ade80, 0 0 20px #4ade80, 0 0 30px #4ade80',
							textShadow: '0 0 5px #4ade80'
						}}
					>
            Online
            {/* {signedAccountId.slice(0, 4)}...
						{signedAccountId.slice(-4)} */}
					</Button>
				) : (
					<Button
						onClick={signIn}
						className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
						style={{
							boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444',
							textShadow: '0 0 5px #ef4444'
						}}
					>
						Login
					</Button>
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
