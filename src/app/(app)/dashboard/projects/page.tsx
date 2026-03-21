import React from 'react'

import { NEXT_PUBLIC_BASE_URL } from '@/app/constants';

export default async function Page() {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/dashboard/projects`);
  const projects = await response.json();

  console.log(projects);

  return (
    <div>
      <h1>Projects</h1>
      {projects.message ? (
        <p>{projects.message}</p>
      ) : (
        <ul>
          {projects.projects.map((project: any) => (
            <li key={project.id}>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}