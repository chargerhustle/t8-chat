import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import NotFound from "@/app/not-found";
import Chat from "./routes/chat-page";
import LaunchChat from "./routes/launch-page";
import CreateAgent from "./routes/agents/create";
import EditAgent from "./routes/agents/edit";
import AccountPage from "./routes/settings/account-page";
import CustomizationPage from "./routes/settings/customization-page";
import HistoryPage from "./routes/settings/history-page";
import ModelsPage from "./routes/settings/models-page";
import ApiKeysPage from "./routes/settings/api-keys-page";
import AttachmentsPage from "./routes/settings/attachments-page";
import ContactPage from "./routes/settings/contact-page";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/error/error-boundary";

export default function App() {
  return (
    <AuthGuard>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<AppLayout />}
            errorElement={<ErrorBoundary />}
          >
            {/* Normal routes */}
            <Route
              index
              element={<LaunchChat />}
              errorElement={<ErrorBoundary />}
            />
            <Route
              path="chat/:threadId"
              element={<Chat />}
              errorElement={<ErrorBoundary />}
            />

            {/* Temporary routes */}
            <Route
              path="temporary"
              element={<LaunchChat />}
              errorElement={<ErrorBoundary />}
            />
            <Route
              path="temporary/chat/:threadId"
              element={<Chat />}
              errorElement={<ErrorBoundary />}
            />

            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Settings routes - each page handles its own layout */}
          <Route
            path="settings"
            element={<Navigate to="/settings/account" replace />}
          />
          <Route
            path="settings/account"
            element={<AccountPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/customization"
            element={<CustomizationPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/history"
            element={<HistoryPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/models"
            element={<ModelsPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/api-keys"
            element={<ApiKeysPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/attachments"
            element={<AttachmentsPage />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="settings/contact"
            element={<ContactPage />}
            errorElement={<ErrorBoundary />}
          />
          {/* Agent routes - each page handles its own layout */}
          <Route
            path="agents/create"
            element={<CreateAgent />}
            errorElement={<ErrorBoundary />}
          />
          <Route
            path="agents/edit/:agentId"
            element={<EditAgent />}
            errorElement={<ErrorBoundary />}
          />
        </Routes>
      </BrowserRouter>
    </AuthGuard>
  );
}
