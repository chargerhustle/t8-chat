import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/app/not-found";
import Chat from "./routes/chat-page";
import LaunchChat from "./routes/launch-page";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/error/error-boundary";

export default function App() {
  return (
    <AuthGuard>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />} errorElement={<ErrorBoundary />}>
            <Route index element={<LaunchChat />} errorElement={<ErrorBoundary />} />
            <Route path="chat/:threadId" element={<Chat />} errorElement={<ErrorBoundary />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGuard>
  );
}
