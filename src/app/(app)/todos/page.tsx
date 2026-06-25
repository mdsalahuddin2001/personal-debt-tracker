import { redirect } from "next/navigation";

export default function TodosPage() {
  redirect("/todos/summary");
}
