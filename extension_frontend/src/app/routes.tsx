import { createHashRouter } from "react-router";
import Layout from "./components/Layout";
import Welcome from "./screens/Welcome";
import CitizenDetails from "./screens/CitizenDetails";
import ServiceSelection from "./screens/ServiceSelection";
import DocumentChecklist from "./screens/DocumentChecklist";
import AIExtraction from "./screens/AIExtraction";
import DataReview from "./screens/DataReview";
import ValidationResult from "./screens/ValidationResult";
import SubmissionSuccess from "./screens/SubmissionSuccess";
import AIAssistant from "./screens/AIAssistant";

// Use hash-based routing so the app works correctly inside a Chrome extension,
// where the base path is not always "/" (e.g., chrome-extension://.../extension_frontend/dist/index.html#/)
export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Welcome },
      { path: "citizen-details", Component: CitizenDetails },
      { path: "service-selection", Component: ServiceSelection },
      { path: "documents", Component: DocumentChecklist },
      { path: "ai-extraction", Component: AIExtraction },
      { path: "data-review", Component: DataReview },
      { path: "validation", Component: ValidationResult },
      { path: "success", Component: SubmissionSuccess },
      { path: "ai-assistant", Component: AIAssistant },
    ],
  },
]);