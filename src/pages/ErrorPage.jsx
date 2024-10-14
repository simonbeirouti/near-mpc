import {useRouteError} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-4xl font-bold mb-4">Oops!</h1>
			<p className="text-xl mb-4">
				Sorry, an unexpected error has occurred.
			</p>
			<p className="text-gray-600 mb-8">
				<i>{error.statusText || error.message}</i>
			</p>
			<Link to="/">
				<Button variant="outline">Go back to homepage</Button>
			</Link>
		</div>
	);
}
