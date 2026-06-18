import ProjectsView from "@/components/views/ProjectsView";
import { getProjects } from "@/lib/queries";

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} />;
}
