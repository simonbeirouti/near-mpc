import {useEffect, Fragment} from "react";
import Navbar from "./components/Navbar";
import {Wallet} from "./services/near-wallet";
import {
	createBrowserRouter,
	RouterProvider,
	Outlet,
	createRoutesFromElements,
	Route,
} from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages";
import AboutPage from "./pages/about";
import EthereumPage from "./pages/ethereum";
import KeysPage from "./pages/keys";
import {useNearStore} from "./store";

// NEAR WALLET
const wallet = new Wallet({network: "testnet"});

function Root() {
	return (
		<Fragment>
			<Navbar />
			<main>
				<Outlet />
			</main>
		</Fragment>
	);
}

function ErrorBoundary() {
	return (
		<Fragment>
			<Navbar />
			<div className="flex-1">
				<ErrorPage />
			</div>
		</Fragment>
	);
}

export const routes = [
	{path: "/", element: <Home />, label: "Home", auth: false},
	{path: "about", element: <AboutPage />, label: "About", auth: false},
	{path: "keys", element: <KeysPage />, label: "Keys", auth: true},
	{path: "ethereum", element: <EthereumPage />, label: "Ethereum", auth: true},
];

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
			{routes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={route.element}
				/>
			))}
		</Route>
	)
);

function App() {
	const setWallet = useNearStore((state) => state.setWallet);
	const setSignedAccountId = useNearStore((state) => state.setSignedAccountId);
	const setWalletInitialized = useNearStore((state) => state.setWalletInitialized);

	useEffect(() => {
		setWallet(wallet);
		wallet.startUp(setSignedAccountId).then(() => {
			setWalletInitialized(true);
		});
	}, [setWallet, setSignedAccountId, setWalletInitialized]);

	return <RouterProvider router={router} />;
}

export default App;
