import React from "react";
import { Refine } from "@refinedev/core";
import { AuthBindings, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { notificationProvider, RefineSnackbarProvider, ThemedLayoutV2, ErrorComponent } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import routerBindings, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { authProvider } from "./authProvider";
import { Login } from "./pages/login";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider theme={createTheme()}>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <Refine
              dataProvider={dataProvider(supabaseClient)}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider(supabaseClient)}
              routerProvider={routerBindings}
              notificationProvider={notificationProvider}
              resources={[
                {
                  name: "users",
                  list: "/users",
                  show: "/users/show/:id",
                },
                {
                  name: "moments",
                  list: "/moments",
                  show: "/moments/show/:id",
                },
                {
                  name: "disputes",
                  list: "/disputes",
                  show: "/disputes/show/:id",
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayoutV2>
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route index element={<NavigateToResource resource="users" />} />
                  <Route path="/users">
                    <Route index element={<div>User List</div>} />
                    <Route path="show/:id" element={<div>User Details</div>} />
                  </Route>
                  <Route path="/moments">
                    <Route index element={<div>Moments List</div>} />
                    <Route path="show/:id" element={<div>Moment Details</div>} />
                  </Route>
                  <Route path="/disputes">
                    <Route index element={<div>Disputes List</div>} />
                    <Route path="show/:id" element={<div>Dispute Details</div>} />
                  </Route>
                </Route>
                <Route
                  element={
                    <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                </Route>
                <Route
                  element={
                    <Authenticated key="authenticated-error" fallback={<Outlet />}>
                      <ThemedLayoutV2>
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
            </Refine>
          </RefineSnackbarProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
