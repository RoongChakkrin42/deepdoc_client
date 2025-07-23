import Layout from "../components/layout";
import { Provider } from "react-redux";
import { store } from "../store";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>DeepDoc</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
