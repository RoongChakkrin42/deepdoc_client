import Layout from "../components/layout";
import Login from "../components/loginDialog";
import { Provider } from "react-redux";
import { store } from "../store";

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Login />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
