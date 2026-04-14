const stats = [
  { value: "10K+", label: "Active Investors" },
  { value: "50M TND", label: "Assets Managed" },
  { value: "15%", label: "Avg. Annual Return" },
  { value: "99.9%", label: "Platform Uptime" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
