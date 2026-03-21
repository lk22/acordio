import { NEXT_PUBLIC_BASE_URL } from '@/app/constants';

export default async function Page() {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/dashboard`);
  const data = await response.json();
  console.log("Dashboard API response:", data);

  return <h1
    className="text-3xl font-bold text-center mt-10"
  >
    {data ? data.message : "No data received from the dashboard API."}
  </h1>
}