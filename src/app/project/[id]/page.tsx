"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProject, MemoraProject } from "@/lib/firebase";
import Wizard from "@/components/Wizard";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<MemoraProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        if (data) {
          setProject(data);
        } else {
          alert("Project not found.");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="font-poppins text-sm text-zinc-400">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return <Wizard initialProject={project} />;
}
