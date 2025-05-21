
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Layout from "../components/Layout";

const Index = () => {
  // For now, we'll just render the Dashboard as our index page
  // Later, you could add authentication logic here to redirect to login if needed
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
