import {NearContext} from "./context";

import {useEffect, useState} from "react";
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

// NEAR WALLET
const wallet = new Wallet({network: "testnet"});

function Root() {
	return (
		<div className="flex flex-col overflow-hidden min-h-screen">
			<Navbar />
			<main>
				<Outlet />
			</main>
		</div>
	);
}

function ErrorBoundary() {
	return (
		<>
			<Navbar />
			<ErrorPage />
		</>
	);
}

export const routes = [
	{path: "/", element: <Home />, label: "Home"},
	{path: "about", element: <AboutPage />, label: "About"},
	{path: "ethereum", element: <EthereumPage />, label: "Ethereum"},
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
	const [signedAccountId, setSignedAccountId] = useState("");

	useEffect(() => {
		wallet.startUp(setSignedAccountId);
	}, []);

	return (
		<NearContext.Provider value={{wallet, signedAccountId}}>
			<RouterProvider router={router} />
		</NearContext.Provider>
	);
}

export default App;
