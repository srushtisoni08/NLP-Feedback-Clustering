import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Themes from "./pages/Themes";
import Sentiment from "./pages/Sentiment";
import Models from "./pages/Models";
import Explorer from "./pages/Explorer";
import Analyze from "./pages/Analyze";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="themes" element={<Themes />} />
        <Route path="sentiment" element={<Sentiment />} />
        <Route path="models" element={<Models />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="analyze" element={<Analyze />} />
      </Route>
    </Routes>
  );
}