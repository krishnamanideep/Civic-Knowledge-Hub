import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import JournalPage from "@/pages/journal-pages";
import { JournalLayout } from "@/components/journal-layout";

function Router() {
  return (
    <JournalLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about"><JournalPage page="about" /></Route>
        <Route path="/particulars"><JournalPage page="particulars" /></Route>
        <Route path="/current-issue"><JournalPage page="current-issue" /></Route>
        <Route path="/archives"><JournalPage page="archives" /></Route>
        <Route path="/editorial-board"><JournalPage page="editorial-board" /></Route>
        <Route path="/submissions"><JournalPage page="submissions" /></Route>
        <Route path="/author-guidelines"><JournalPage page="author-guidelines" /></Route>
        <Route path="/peer-review"><JournalPage page="peer-review" /></Route>
        <Route path="/publication-ethics"><JournalPage page="publication-ethics" /></Route>
        <Route path="/faq"><JournalPage page="faq" /></Route>
        <Route path="/contact"><JournalPage page="contact" /></Route>
        <Route><JournalPage page="not-found" /></Route>
      </Switch>
    </JournalLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;