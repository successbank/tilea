const stats = [
  { value: '1,247', label: 'Users' },
  { value: '5,892', label: 'Calcs' },
  { value: '347', label: 'Auctions' },
  { value: '18%', label: 'Saving' },
];

export default function StatsSection() {
  return (
    <section className="bg-primary text-white py-20 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 tablet:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-4xl desktop:text-5xl font-black mb-2">{s.value}</p>
            <p className="text-sm text-white/70 font-medium uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
