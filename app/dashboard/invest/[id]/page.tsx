import { redirect } from "next/navigation"

interface InvestPageProps {
  params: Promise<{ id: string }>
}

export default async function InvestPage({ params }: InvestPageProps) {
  const { id } = await params
  redirect(`/investment/${id}`)
}
