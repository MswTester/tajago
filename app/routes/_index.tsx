import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Provider } from "react-redux";
import { useStore } from "~/store/useStore";
import Main from "./-main";

export const meta: MetaFunction = () => {
  return [
    { title: "Tajago" },
    { name: "description", content: "Tajago" },
  ];
};

export default function Index() {

  const store = useStore()

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
