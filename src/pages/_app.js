import Layout from "../components/layout";
import { Provider } from "react-redux";
import { store } from "../store";

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
