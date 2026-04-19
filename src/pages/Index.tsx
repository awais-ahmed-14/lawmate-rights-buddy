import { Navigate } from 'react-router-dom';

// After login, default user entry point is the AI Assistant.
const Index = () => <Navigate to="/assistant" replace />;

export default Index;
