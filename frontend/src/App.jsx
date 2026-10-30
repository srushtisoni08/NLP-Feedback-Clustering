import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Themes from "./pages/Themes";
import Sentiment from "./pages/Sentiment";
import { PageHeader, Card } from "./components/ui";

const Soon = ({ title }) => (
  <>
    <PageHeader title={title} />
    <Card><p className="text-sm text-muted">Coming in the next chunk.</p></Card>
  </>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="themes" element={<Themes />} />
        <Route path="sentiment" element={<Sentiment />} />
        <Route path="models" element={<Soon title="Model Comparison" />} />
        <Route path="explorer" element={<Soon title="Feedback Explorer" />} />
        <Route path="analyze" element={<Soon title="Analyze New Feedback" />} />
      </Route>
    </Routes>
  );
}