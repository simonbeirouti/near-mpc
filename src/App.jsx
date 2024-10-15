import {useEffect, Fragment, lazy, Suspense} from "react";
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
import { useNearStore } from "./store";
import { CircleHelp, Compass, Key, Coins, Database } from "lucide-react";

// NEAR WALLET
const wallet = new Wallet({network: "testnet"});

// Lazy load components
const Home = lazy(() => import("./pages"));
const AboutPage = lazy(() => import("./pages/about"));
const EthereumPage = lazy(() => import("./pages/explore/ethereum"));
const ExplorePage = lazy(() => import("./pages/explore"));
const StoragePage = lazy(() => import("./pages/storage"));
const KeysPage = lazy(() => import("./pages/keys"));
const NFTsPage = lazy(() => import("./pages/explore/nfts"));
const TokensPage = lazy(() => import("./pages/explore/tokens"));
const ContractsPage = lazy(() => import("./pages/explore/contract"));

const LoadingSpinner = () => (
	<div className="flex justify-center items-center h-screen">
		<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
	</div>
);

function Root() {
	return (
		<Fragment>
			<main className="flex-grow">
				<Outlet />
			</main>
			<Navbar className="fixed bottom-0 left-0 right-0" />
		</Fragment>
	);
}

function ErrorBoundary() {
	return (
		<Fragment>
			<div className="flex-grow">
				<ErrorPage />
			</div>
			<Navbar className="fixed bottom-0 left-0 right-0" />
		</Fragment>
	);
}

// Wrap your routes with Suspense
export const routes = [
	{
		path: "/",
		element: <Suspense fallback={<LoadingSpinner />}><Home /></Suspense>,
		label: "Home",
		icon: <Home className="h-4 w-4" />,
		auth: false,
	},
	{
		path: "about",
		element: <Suspense fallback={<div>Loading...</div>}><AboutPage /></Suspense>,
		label: "About",
		icon: <CircleHelp className="h-4 w-4" />,
    auth: false,
	},
	{
		path: "explore",
		element: (
			<Suspense fallback={<div>Loading...</div>}>
				<Outlet />
			</Suspense>
		),
		label: "Explore",
		icon: <Compass className="h-4 w-4" />,
		auth: false,
		children: [
			{ index: true, element: <ExplorePage />, auth: false, label: "Explore" },
			{ path: "ethereum", element: <EthereumPage />, auth: false, label: "Ethereum" },
			{ path: "nfts", element: <NFTsPage />, auth: false, label: "NFTs" },
			{ path: "tokens", element: <TokensPage />, auth: false, label: "Tokens" },
			{ path: "contracts", element: <ContractsPage />, auth: false, label: "Contracts" }
		],
	},
	{
		path: "keys",
		element: <Suspense fallback={<div>Loading...</div>}><KeysPage /></Suspense>,
		label: "Keys",
		icon: <Key className="h-4 w-4" />,
    auth: true,
	},
	{
		path: "storage",
		element: <Suspense fallback={<div>Loading...</div>}><StoragePage /></Suspense>,
		label: "Storage",
		icon: <Database className="h-4 w-4" />,
    auth: true,
	},
];

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
			{routes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={route.element}
				>
					{route.children && route.children.map((childRoute) => (
						<Route
							key={childRoute.path || 'index'}
							index={childRoute.index}
							path={childRoute.path}
							element={
								<Suspense fallback={<div>Loading...</div>}>
									{childRoute.element}
								</Suspense>
							}
						/>
					))}
				</Route>
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
