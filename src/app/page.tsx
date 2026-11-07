import { redirect } from "next/navigation";

// The project has no landing page; send visitors to the admin panel for now.
export default function RootPage() {
  redirect("/admins");
}
