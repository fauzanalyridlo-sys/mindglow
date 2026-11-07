import { redirect } from "next/navigation";

export default function InvalidLoginPathPage() {
  redirect("/login");
}
